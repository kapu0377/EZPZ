import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Logo.css';

const Logo = () => {
  const [currentText, setCurrentText] = useState('acking');
  const [isChanging, setIsChanging] = useState(false);
  const texts = ['acking', 'assing', 'arking'];
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setIsChanging(true);
      
      // 텍스트가 들어간 후에 변경
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % texts.length;
        setCurrentText(texts[currentIndex]);
        
        // 약간의 딜레이 후 다시 나타나기
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
