import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Logo.css';

const LOGO_TEXTS = ['acking', 'assing', 'arking'];

const Logo = () => {
  const [currentText, setCurrentText] = useState('acking');
  const [isChanging, setIsChanging] = useState(false);
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setIsChanging(true);
      
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % LOGO_TEXTS.length;
        setCurrentText(LOGO_TEXTS[currentIndex]);
        
        setTimeout(() => {
          setIsChanging(false);
        }, 150);
      }, 300);
      
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link to="/" className="logo">
      <span className="logo-text">EZPZ</span>
      <span className="logo-hover">
        EZP<span className={`small ${isChanging ? 'changing' : ''}`}>{currentText}</span>Z
      </span>
    </Link>
  );
};

export default Logo;
