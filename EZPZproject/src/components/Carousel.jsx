import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true
  };

  const carouselStyle = {
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const slideStyle = {
    position: 'relative',
    height: '400px'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '10px'
  };

  const textStyle = {
    position: 'absolute',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    left: '20px',
    margin: '0'
  };

  return (
    <div style={carouselStyle}>
      <Slider {...settings}>
        <div style={slideStyle}>
          <img 
            src="https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&auto=format&fit=crop" 
            alt="여행 준비" 
            style={imageStyle}
          />
          <h3 style={{...textStyle, bottom: '60px'}}>여행 준비 체크리스트</h3>
          <p style={{...textStyle, bottom: '30px'}}>완벽한 여행을 위한 필수 준비물</p>
        </div>
        <div style={slideStyle}>
          <img 
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop" 
            alt="인기 여행지" 
            style={imageStyle}
          />
          <h3 style={{...textStyle, bottom: '60px'}}>인기 여행지 추천</h3>
          <p style={{...textStyle, bottom: '30px'}}>2025년 꼭 가봐야 할 여행지</p>
        </div>
        <div style={slideStyle}>
          <img 
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop" 
            alt="계절별 아이템" 
            style={imageStyle}
          />
          <h3 style={{...textStyle, bottom: '60px'}}>계절별 추천 아이템</h3>
          <p style={{...textStyle, bottom: '30px'}}>날씨에 맞는 완벽한 여행 준비</p>
        </div>
      </Slider>
    </div>
  );
};

export default Carousel;
