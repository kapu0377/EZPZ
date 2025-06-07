import { Link } from 'react-router-dom';
import './Logo.css';
import React from 'react';

const Logo = React.memo(() => {
  return (
    <Link to="/" className="logo">
      <span className="logo-text">EZPZ</span>
    </Link>
  );
});

export default Logo;
