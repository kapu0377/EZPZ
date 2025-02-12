import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = () => {
  return (
    <Link to="/" className="logo">
      <span className="logo-text">EZPZ</span>
      <span className="logo-hover">
        EZP<span className="small">acking</span>Z
      </span>
    </Link>
  );
};

export default Logo;
