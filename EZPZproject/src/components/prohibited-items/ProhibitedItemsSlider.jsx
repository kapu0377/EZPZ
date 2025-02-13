import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProhibitedItemsSlider.css';

const ProhibitedItemsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderContentRef = useRef(null);
  const navigate = useNavigate();

  // 슬라이드 데이터를 직접 그룹화하여 정의
  const slides = [
    [
      { icon: "🧪", title: "화학물질", description: "인체에 해롭거나 위험한 화학물질" },
      { icon: "💧", title: "액체/겔", description: "100ml 이상의 액체 및 젤류" },
      { icon: "💥", title: "폭발/인화성", description: "폭발성 또는 인화성 물질" },
      { icon: "🔫", title: "화기류", description: "모든 종류의 화기 및 무기류" }
    ],
    [
      { icon: "🔪", title: "날붙이", description: "날카로운 물체나 끝이 뾰족한 도구" },
      { icon: "🔨", title: "둔기", description: "무겁고 둔탁한 손상을 입힐 수 있는 도구" },
      { icon: "✈️", title: "고위험 비행편", description: "보안 위협이 높은 항공편 제한 물품" }
    ]
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

  useEffect(() => {
    const timer = setInterval(changeSlide, 3000);
    return () => clearInterval(timer);
  }, [isAnimating]);

  const handleClick = () => {
    navigate('/prohibited');
  };

  return (
    <div className="prohibited-items-slider" onClick={handleClick}>
      <div className="slider-wrapper">
        <div 
          ref={sliderContentRef}
          className={`slider-content ${currentSlide === 0 ? 'four-items' : 'three-items'}`}
        >
          {slides[currentSlide].map((item, index) => (
            <div key={index} className="slide-item">
              <div className="slide-icon">{item.icon}</div>
              <div className="slide-text">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
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
          />
        ))}
      </div>
    </div>
  );
};

export default ProhibitedItemsSlider; 