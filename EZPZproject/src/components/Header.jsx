import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../logo/Logo";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar"; // ✅ 사이드바 분리

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <TopBar />
      <div className="header-content">
        {/* 로고 - 모바일에서는 왼쪽으로 배치 */}
        <div className="logo-container">
          <Logo />
        </div>

        {/* 데스크탑 네비게이션 */}
        <nav className="main-nav">
          <Link to="/prohibited">금지물품</Link>
          <Link to="/board">게시판</Link>
          <Link to="/checklist">체크리스트</Link>
          <Link to="/parking">주차현황</Link>
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {/* ✅ 사이드바 컴포넌트로 분리 */}
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </header>
  );
};

export default Header;
