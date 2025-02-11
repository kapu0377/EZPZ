import React, { createContext, useContext, useState, useEffect } from "react";
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기화 및 토큰 복구 시도
  useEffect(() => {
    const initializeAuth = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      const storedAccessToken = localStorage.getItem("accessToken");

      // 토큰이 모두 없는 경우 나머지 인증 관련 데이터도 제거합니다.
      if (!storedAccessToken && !refreshToken) {
        clearAuthData();
      } else if (refreshToken && !storedAccessToken) {
        try {
          // 리프레시 토큰으로 새 액세스 토큰 발급 시도
          const data = await authApi.refresh(refreshToken);
          if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            setToken(data.accessToken);

            // 사용자 정보 복구
            const mid = localStorage.getItem("mid");
            const username = localStorage.getItem("username");
            const name = localStorage.getItem("name");

            if (mid && username) {
              setUser({
                mid,
                username,
                name: name || username,
              });
            } else {
              // 인증에 필요한 정보가 누락되었다면 클리어
              clearAuthData();
            }
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("토큰 갱신 실패:", error);
          handleLogout();
        }
      } else if (storedAccessToken) {
        // 액세스 토큰이 있는 경우 사용자 정보 복구
        const mid = localStorage.getItem("mid");
        const username = localStorage.getItem("username");
        const name = localStorage.getItem("name");

        if (mid && username) {
          setToken(storedAccessToken);
          setUser({
            mid,
            username,
            name: name || username,
          });
        } else {
          clearAuthData();
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("mid", data.mid);
        localStorage.setItem("username", credentials.username);
        localStorage.setItem("name", data.name);
        
        setToken(data.accessToken);
        setUser({
          mid: data.mid,
          username: credentials.username,
          name: data.name
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("로그인 실패: " + error.message);
      return false;
    }
  };

  if (!isInitialized) {
    return <div>로딩 중...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout: handleLogout, token }}>
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
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("mid");
  localStorage.removeItem("username");
  localStorage.removeItem("name");
  sessionStorage.removeItem("searchResults");
}





