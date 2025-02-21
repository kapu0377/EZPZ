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
            <Link to="/checklist">체크리스트</Link>
            <Link to="/parking">주차현황</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
