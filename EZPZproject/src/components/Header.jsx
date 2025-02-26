import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../logo/Logo";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar"; // ✅ 사이드바 분리
import "./Header.css"; // ✅ 새로운 스타일 추가

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen1, setDropdownOpen1] = useState(false); // ✅ 금지물품 드롭다운 상태 추가
  const [dropdownOpen2, setDropdownOpen2] = useState(false); // ✅ 게시판판 드롭다운 상태 추가
  
  return (
    <header className="header">
      <TopBar />
      <div className="header-content">
        {/* 로고 */}
        <div className="logo-container">
          <Logo />
        </div>

        {/* 네비게이션 */}
        <nav className="main-nav">
          <div 
            className="nav-item dropdown"
            onMouseEnter={() => setDropdownOpen1(true)}
            onMouseLeave={() => setDropdownOpen1(false)}
          >
            <Link to="/prohibited" className="nav-link">금지물품</Link>
            {dropdownOpen1 && (
              <div className="dropdown-menu">
                <Link to="/prohibited" className="dropdown-item">금지물품 목록</Link>
                <Link to="/airport-detections" className="dropdown-item">공항 별 적발현황</Link>
                <Link to="/item-search" className="dropdown-item">항공 물품 검색</Link>
              </div>
            )}
          </div>
          <div 
            className="nav-item dropdown"
            onMouseEnter={() => setDropdownOpen2(true)}
            onMouseLeave={() => setDropdownOpen2(false)}
          >
            <Link to="/board" className="nav-link">게시판</Link>
            {dropdownOpen2 && (
              <div className="dropdown-menu">
                <Link to="/board" className="dropdown-item">자유게시판</Link>
                <Link to="/faq" className="dropdown-item">FAQ</Link>
              </div>
            )}
          </div>
          <Link to="/checklist">체크리스트</Link>
          <Link to="/parking">주차현황</Link>
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {/* 사이드바 */}
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </header>
  );
};

export default Header;
