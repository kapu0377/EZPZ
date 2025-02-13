import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Logo.css';
import bagIcon from '../assets/icons/bag.svg';
import planeIcon from '../assets/icons/plane.svg';
import carIcon from '../assets/icons/car.svg';

const Icons = {
  acking: <img src={bagIcon} alt="bag" />,
  assing: <img src={planeIcon} alt="plane" />,
  arking: <img src={carIcon} alt="car" />
};

const Logo = () => {
  const [currentText, setCurrentText] = useState('acking');
  const [isChanging, setIsChanging] = useState(false);
  const texts = ['acking', 'assing', 'arking'];
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setIsChanging(true);
      
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % texts.length;
        setCurrentText(texts[currentIndex]);
        
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
        <span className={`icon-container ${isChanging ? 'changing' : ''}`}>
          {Icons[currentText]}
        </span>
      </span>
    </Link>
  );
};

export default Logo;
