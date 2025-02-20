import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProhibitedItemsSlider.css';
import arrow from '../../assets/img/arrow.png';  // 화살표 이미지 추가

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
        { icon: "🔪", title: "날붙이" },
        { icon: "🔨", title: "둔기" },
        { icon: "🔫", title: "화기류" }
      ]
    },
    {
      type: "인체유해류",
      color: "#E74C3C",
      items: [
        { icon: "🧪", title: "화학물질" },
        { icon: "💥", title: "폭발/인화성" },
        { icon: "💧", title: "액체/겔" }
      ]
    }
  ];

  const handleMoreClick = (e) => {
    e.stopPropagation(); // 🔹 슬라이더 클릭 이벤트 방지
    navigate('/prohibited');
  };

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

  return (
    <div className="prohibited-items-slider"> {/* 🔹 클릭 이벤트 제거됨 */}
      <div className="slider-header">
        <h2>{slides[currentSlide].type}</h2>
        <img
          src={arrow}
          alt="화살표"
          className="arrow-icon"
          onClick={handleMoreClick} // 🔹 화살표 클릭 시만 이동
        />
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
