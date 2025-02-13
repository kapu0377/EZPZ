import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  
  console.log("Header에서의 user 객체:", user); // user 객체 확인

  return (
    <header className="header">
      <Link to="/" className="logo">EZPacking</Link>
      <div className="nav-container">
        {user && (
          <div className="user-menu">
            <span className="welcome-message">환영합니다, {user.name}님!</span>
            <button onClick={logout} className="logout-button">로그아웃</button>
          </div>
        )}
        <nav className="main-nav">
          <Link to="/prohibited">금지물품</Link>
          <Link to="/detection">적발현황</Link>
          {user && <Link to="/mypage">마이페이지</Link>}
          {!user && <Link to="/login">로그인</Link>}
          <Link to="/board">게시판</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;