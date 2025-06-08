import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  checkAuthStatus, 
  validateTokenIntegrity, 
  secureLogout, 
  refreshAccessToken,
  getUsernameFromRefreshToken,
  isTokenExpired
} from '../utils/authUtils';
import { getSecureItem } from '../utils/cryptoUtils';
import { registerTokenRefreshCallback, unregisterTokenRefreshCallback } from '../utils/axios';
import authApi from '../api/authApi';
import { getChecklists } from "../api/checklist/checklistApi";
import { saveAuthTokens } from '../utils/authUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenStatus, setTokenStatus] = useState({ isValid: false, reason: null });
  const [checklists, setChecklists] = useState([]);
  
  // 초기화 완료 플래그
  const isInitialized = useRef(false);

  const checkTokenStatus = useCallback(() => {
    const authStatus = checkAuthStatus();
    const integrity = validateTokenIntegrity();
    
    setIsAuthenticated(authStatus.isAuthenticated);
    setTokenStatus(integrity);
    
    if (authStatus.isAuthenticated && integrity.isValid) {
      const username = getUsernameFromRefreshToken();
      setUser(username ? { username } : null);
    } else {
      setUser(null);
    }
    
    if (authStatus.needsRefresh && integrity.isValid) {
              console.log('accessToken이 없음 - axios interceptor가 자동 재발급 처리할 예정');
    }
    
    return authStatus.isAuthenticated && integrity.isValid;
  }, []); // 의존성 배열을 비움

  const handleTokenRefresh = useCallback((success) => {
    if (success) {
      console.log('토큰 갱신 성공 - 인증 상태 업데이트');
      checkTokenStatus();
    } else {
      console.log('토큰 갱신 실패 - 로그아웃 처리');
      setIsAuthenticated(false);
      setUser(null);
      setTokenStatus({ isValid: false, reason: 'REFRESH_FAILED' });
    }
  }, [checkTokenStatus]);

  const logout = useCallback(async () => {
    try {
      await secureLogout();
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setTokenStatus({ isValid: false, reason: 'LOGGED_OUT' });
      setChecklists([]);
    }
  }, []);

  const forceTokenRefresh = useCallback(async () => {
    try {
      await refreshAccessToken();
      checkTokenStatus();
      return true;
    } catch (error) {
      console.error('수동 토큰 갱신 실패:', error);
      await logout();
      return false;
    }
  }, [checkTokenStatus, logout]);

  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const authStatus = checkAuthStatus();
        const integrity = validateTokenIntegrity();
        
        setIsAuthenticated(authStatus.isAuthenticated);
        setTokenStatus(integrity);
        
        if (authStatus.isAuthenticated && integrity.isValid) {
          const username = getUsernameFromRefreshToken();
          setUser(username ? { username } : null);
          
          try {
            const userData = await authApi.getUserProfile();
            setUser(userData);
            console.log('사용자 프로필 로드 완료:', userData);
          } catch (profileError) {
            console.warn('사용자 프로필 조회 실패, 기본 정보 유지:', profileError);
            setUser(username ? { username } : null);
          }
        } else {
          setUser(null);
        }
        
        if (authStatus.needsRefresh && integrity.isValid) {
          console.log('accessToken이 없음 - axios interceptor가 자동 재발급 처리할 예정');
        }
        
        if (authStatus.isAuthenticated && integrity.isValid) {
          console.log('인증 상태 확인 완료');
        } else {
          console.log('인증 실패 - 로그아웃 상태');
        }
      } catch (error) {
        console.error('인증 초기화 중 오류:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };

    initializeAuth();
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 토큰 새로고침 콜백 등록 - 한 번만 실행
  useEffect(() => {
    registerTokenRefreshCallback(handleTokenRefresh);
    
    return () => {
      unregisterTokenRefreshCallback(handleTokenRefresh);
    };
  }, [handleTokenRefresh]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const userData = await authApi.getUserProfile(); 
      setUser(userData); 
    } catch (error) {
      console.error("회원 정보 갱신 실패:", error);
      console.error("오류 상세:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }, []);

  const getCurrentUser = useCallback(() => {
    return user;
  }, [user]);

  const getDisplayName = useCallback(() => {
    if (!user) {
      return '사용자';
    }
    
    const displayName = user.name || user.username || user.memberName || user.userId || '사용자';
    
    return displayName;
  }, [user]);

  const fetchChecklists = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('인증되지 않은 사용자 - 체크리스트 조회 건너뜀');
      return;
    }

    try {
      const data = await getChecklists();
      setChecklists(data || []);
    } catch (error) {
      console.error("체크리스트 불러오기 실패:", error);
      setChecklists([]);
    }
  }, [isAuthenticated]);

  const login = useCallback(async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      
      saveAuthTokens(data);
      
      setIsAuthenticated(true);
      
      const username = getUsernameFromRefreshToken();
      if (username) {
        setUser({ username });
      }
    
      checkTokenStatus();

      try {
        await fetchUserProfile(); 
      } catch (profileError) {
        console.warn('사용자 프로필 조회 실패, 기본 사용자 정보 유지:', profileError);
      }
      
      await fetchChecklists();
      return true;

    } catch (error) {
      console.error('로그인 에러:', error);
      setUser(null);
      setIsAuthenticated(false);

      if (error.response?.data) {
        alert(error.response.data);
      } else {
        alert("로그인에 실패했습니다.");
      }
      return false;
    }
  }, [fetchUserProfile, fetchChecklists, checkTokenStatus]);

  const value = {
    isAuthenticated,
    user,
    isLoading,
    tokenStatus,
    logout,
    forceTokenRefresh,
    checkTokenStatus,
    fetchUserProfile,
    getCurrentUser,
    getDisplayName,
    login,
    fetchChecklists,
    checklists
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};





