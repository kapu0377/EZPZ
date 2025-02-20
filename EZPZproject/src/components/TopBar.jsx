import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";
import Register from "./Register";
import "./TopBar.css";

const TopBar = () => {
  const { user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <div className="auth-buttons">
          {user ? (
            <div className="user-menu">
              <span className="welcome-message">환영합니다, {user.name}님!</span>
              <button onClick={logout} className="logout-button">로그아웃</button>
            </div>
          ) : (
            <>
              <button onClick={() => setIsLoginOpen(true)} className="login-button">
                로그인
              </button>
              <button onClick={() => setIsRegisterOpen(true)} className="register-button">
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Register isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  );
};

export default TopBar; 