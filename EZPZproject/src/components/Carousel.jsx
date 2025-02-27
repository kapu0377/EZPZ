import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Carousel.css";

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    className: "carousel-slider"
  };

  const carouselStyle = {
    width: '100%',
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '0 20px',
    borderRadius: '10px',
    overflow: 'hidden'
  };

  const slideStyle = {
    position: 'relative', // 슬라이드 개별적인 스타일 적용
    height: '350px',
    borderRadius: '10px',
    overflow: 'hidden'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const sloganContainer = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    textAlign: 'center'
  };

  const sloganStyle = {
    color: 'white',
    fontSize: '32px',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    padding: '10px 20px',
    background: 'rgba(0, 0, 0, 0.3)', // 가독성을 높이기 위한 반투명 배경
    display: 'inline-block',
    borderRadius: '10px'
  };

  return (
    <div style={carouselStyle}>
      <Slider {...settings}>
        <div style={slideStyle}>
          <img 
            src="https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?w=1200&h=350&auto=format&fit=crop" 
            alt="여행 준비" 
            style={imageStyle}
          />
          <div style={sloganContainer}>
            <div style={sloganStyle}>Have to think deeply about safety for a high flight</div>
          </div>
        </div>
        <div style={slideStyle}>
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=350&auto=format&fit=crop" 
            alt="인기 여행지" 
            style={imageStyle}
          />
          <div style={sloganContainer}>
            <div style={sloganStyle}>"Safety doesn't happen by accident, it's created by effort." -Mark Twain</div>
          </div>
        </div>
        <div style={slideStyle}>
          <img 
            src="https://images.unsplash.com/photo-1499591934245-40b55745b905?w=1200&h=350&auto=format&fit=crop" 
            alt="계절별 아이템" 
            style={imageStyle}
          />
          <div style={sloganContainer}>
            <div style={sloganStyle}>Safety makes flight, we make safety, hope your safe flight!</div>
          </div>
        </div>
      </Slider>
    </div>
  );
};

export default Carousel;
