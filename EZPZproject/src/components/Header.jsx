import React from "react";
import { Link } from "react-router-dom";
import Logo from "../logo/Logo";
import TopBar from "./TopBar";

const Header = () => {
  return (

    <header className="header">
      <TopBar/>
      <div className="header-content">
        <Logo />
        <div className="nav-container">
          <nav className="main-nav">
            <Link to="/prohibited">금지물품</Link>
            <Link to="/board">게시판</Link>
            <Link to="/mypage">마이페이지</Link>
            <Link to="/parking">주차현황</Link>
          </nav>
        </div>
      </div>
      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
};

export default Header;
