import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ menuOpen, setMenuOpen }) => {
  return (
    <div className={`sidebar-menu ${menuOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={() => setMenuOpen(false)}>✖</button>
      <nav className="sidebar-nav">
        <Link to="/prohibited" onClick={() => setMenuOpen(false)}>금지물품</Link>
        <Link to="/board" onClick={() => setMenuOpen(false)}>게시판</Link>
        <Link to="/checklist" onClick={() => setMenuOpen(false)}>체크리스트</Link>
        <Link to="/parking" onClick={() => setMenuOpen(false)}>주차현황</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
