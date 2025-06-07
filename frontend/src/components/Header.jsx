import React, { useState, useMemo } from "react";
import Logo from "../logo/Logo";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar"; 
import "./Header.css"; 
import NavLinks from "./NavLinks";
import { AuthProvider } from "../contexts/AuthContext";

const Header = React.memo(() => {
  const [menuOpen, setMenuOpen] = useState(false);
  const memoizedNavLinks = useMemo(() => <NavLinks />, []);
  
  return (
    <header className="header">
      <AuthProvider>
        <TopBar />
      </AuthProvider>
      <div className="header-content">
        <div className="logo-container">
          <Logo />
        </div>
        <nav className="main-nav">
          {memoizedNavLinks}
        </nav>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </header>
  );
});

Header.whyDidYouRender = true;

export default Header;
