import React, { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = React.memo(({ menuOpen, setMenuOpen }) => {
  const [subMenuOpen1, setSubMenuOpen1] = useState(false);
  const [subMenuOpen2, setSubMenuOpen2] = useState(false); 

  return (
    <div className={`sidebar-menu ${menuOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={() => setMenuOpen(false)}>
        ✖
      </button>
      <nav className="sidebar-nav">
   
        <div
          className="sidebar-item"
          onClick={() => setSubMenuOpen1(!subMenuOpen1)}
        >
          금지물품
          <span className={`arrow ${subMenuOpen1 ? "open" : ""}`}>▼</span>
        </div>
        {subMenuOpen1 && (
          <div className="sidebar-submenu">
            <Link to="/prohibited" onClick={() => setMenuOpen(false)}>
              금지물품 목록
            </Link>
            <Link to="/airport-detections" onClick={() => setMenuOpen(false)}>
              공항 별 적발현황
            </Link>
            <Link to="/search" onClick={() => setMenuOpen(false)}>
              항공 물품 검색
            </Link>
          </div>
        )}
        <div
          className="sidebar-item"
          onClick={() => setSubMenuOpen2(!subMenuOpen2)}
        >
          게시판
          <span className={`arrow ${subMenuOpen2 ? "open" : ""}`}>▼</span>
        </div>
        {subMenuOpen2 && (
          <div className="sidebar-submenu">
            <Link to="/board" onClick={() => setMenuOpen(false)}>
              자유게시판
            </Link>
            <Link to="/faq" onClick={() => setMenuOpen(false)}>
              FAQ
            </Link>
          </div>
        )}
        <Link to="/checklist" onClick={() => setMenuOpen(false)}>
          체크리스트
        </Link>
        <Link to="/parking" onClick={() => setMenuOpen(false)}>
          주차현황
        </Link>
      </nav>
    </div>
  );
});

export default Sidebar;
