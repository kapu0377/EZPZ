import React, { createContext, useContext, useState, useEffect } from "react";
import authApi from '../api/authApi';
import { getChecklists } from "../api/checklist/checklistApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [checklists, setChecklists] = useState([]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");

      if (storedAccessToken) {
        try {
          const userData = await authApi.getUserProfile(); // API에서 모든 회원 정보 가져오기
          if (userData) {
            setUser({
              username: userData.username,
              name: userData.name,
              phone: userData.phone || "", // 추가
              address: userData.address || "", // 추가
              email: userData.email || "", // 추가
            });
          }
          fetchChecklists();  //체크리스트 자동 불러오기
        } catch (error) {
          console.error("사용자 정보를 가져오는 중 오류 발생:", error);
        }
      }
      setIsInitialized(true);
    };


    initializeAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      clearAuthData();
      setToken(null);
      setUser(null);
      window.location.href = '/';
    }
  };

  const login = async (credentials) => {
    try {
      // console.log('로그인 시도:', credentials);
      const data = await authApi.login(credentials);
      // console.log('로그인 응답:', data);

      if (data.accessToken) {
        // 토큰과 사용자 정보를 localStorage에 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('username', data.username);
        localStorage.setItem('name', data.name);

        // Context 상태 업데이트
        setToken(data.accessToken);
        setUser({
          username: data.username,
          name: data.name
        });

        // console.log('로그인 성공 - 상태 업데이트 완료');
        // window.location.href = '/';
        fetchChecklists();
        return true;
      }

      console.error('토큰이 없는 응답:', data);
      return false;
    } catch (error) {
      console.error('로그인 에러:', error);
      // 에러 발생 시 저장된 데이터 초기화
      localStorage.removeItem('accessToken');
      localStorage.removeItem('username');
      localStorage.removeItem('name');
      setToken(null);
      setUser(null);

      if (error.response?.data) {
        alert(error.response.data);
      } else {
        alert("로그인에 실패했습니다.");
      }
      return false;
    }
  };

  const fetchChecklists = async () => {
    try {
      const data = await getChecklists();
      setChecklists(data);
    } catch (error) {
      console.error("체크리스트 불러오기 실패:", error);
    }
  };

  const updateUser = (updatedUser) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUser,
    }));
    localStorage.setItem("name", updatedUser.name); // localStorage에도 반영
  };

  if (!isInitialized) {
    return <div>로딩 중...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout: handleLogout, token, updateUser, checklists, fetchChecklists  }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function clearAuthData() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("username");
  localStorage.removeItem("name");
  sessionStorage.removeItem("searchResults");
}





