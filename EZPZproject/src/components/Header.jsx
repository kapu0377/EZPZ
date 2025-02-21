import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../logo/Logo";
import Login from "./Login";

const Header = () => {
  const { user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  console.log("Header에서의 user 객체:", user); // user 객체 확인

  return (
    <header className="header">
      <Logo />
      <div className="nav-container">
        {user && (
          <div className="user-menu">
            <span className="welcome-message">환영합니다, {user.name}님!</span>
            <button onClick={logout} className="logout-button">로그아웃</button>
          </div>
        )}
        <nav className="main-nav">
          <Link to="/prohibited">금지물품</Link>
          <Link to="/board">게시판</Link>
          {user && <Link to="/checklist">체크리스트</Link>}
          {!user && (
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="nav-login-button"
            >
              로그인
            </button>
          )}
          <Link to="/parking">주차현황</Link>
        </nav>
      </div>
      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
};

export default Header;