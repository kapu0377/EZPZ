import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProhibitedItemsSlider.css';

const ProhibitedItemsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderContentRef = useRef(null);
  const navigate = useNavigate();

  const slides = [
    {
      type: "신체상해류",
      color: "#4B89DC",
      items: [
        { 
          icon: "🔪", 
          title: "날붙이", 
          examples: "칼, 송곳, 도끼, 드릴날, 가위, 면도칼, 작살" 
        },
        { 
          icon: "🔨", 
          title: "둔기", 
          examples: "망치, 곡괭이, 야구방망이, 골프채, 쇠파이프" 
        },
        { 
          icon: "🔫", 
          title: "화기류", 
          examples: "총기, 전자충격기, 총알, 스프레이, 라이터" 
        }
      ]
    },
    {
      type: "인체유해류",
      color: "#E74C3C",
      items: [
        { 
          icon: "🧪", 
          title: "화학물질", 
          examples: "산성물질, 염기성물질, 수은, 표백제, 농약" 
        },
        { 
          icon: "💥", 
          title: "폭발/인화성", 
          examples: "폭죽, 화약, 부탄가스, 산소통, 성냥" 
        },
        { 
          icon: "💧", 
          title: "액체/겔", 
          examples: "음료수, 화장품, 샴푸, 젤, 로션(100ml 초과)" 
        }
      ]
    }
  ];

  const changeSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const content = sliderContentRef.current;
    content.classList.add('slide-exit');

    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      content.classList.remove('slide-exit');
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 300);
  };

  const handleDotClick = (index) => {
    if (isAnimating || index === currentSlide) return;
    
    setIsAnimating(true);
    const content = sliderContentRef.current;
    content.classList.add('slide-exit');

    setTimeout(() => {
      setCurrentSlide(index);
      content.classList.remove('slide-exit');
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 300);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isAnimating) {
        changeSlide();
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isAnimating]);

  const handleClick = () => {
    navigate('/prohibited');
  };

  return (
    <div className="prohibited-items-slider" onClick={handleClick}>
      <div className="slider-header">
        <h2>{slides[currentSlide].type}</h2>
      </div>
      <div className="slider-wrapper">
        <div 
          ref={sliderContentRef}
          className="slider-content"
          style={{ '--slide-color': slides[currentSlide].color }}
        >
          {slides[currentSlide].items.map((item, index) => (
            <div key={index} className="slide-item">
              <div className="slide-icon">{item.icon}</div>
              <div className="slide-text">
                <h3>{item.title}</h3>
                <p>{item.examples}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="slider-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleDotClick(index);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProhibitedItemsSlider; 