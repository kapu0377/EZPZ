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

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        <div className="carousel-slide">
          <img 
            src="https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?w=1200&h=350&auto=format&fit=crop" 
            alt="여행 준비" 
            className="carousel-image"
          />
          {/* 슬로건 위치 조정 */}
          <div className="slogan-container">
            <div className="slogan-text">Have to think deeply about safety for a high flight</div>
          </div>
        </div>
        <div className="carousel-slide">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=350&auto=format&fit=crop" 
            alt="인기 여행지" 
            className="carousel-image"
          />
          <div className="slogan-container">
            <div className="slogan-text">"Safety doesn't happen by accident, it's created by effort." -Mark Twain</div>
          </div>
        </div>
        <div className="carousel-slide">
          <img 
            src="https://images.unsplash.com/photo-1499591934245-40b55745b905?w=1200&h=350&auto=format&fit=crop" 
            alt="계절별 아이템" 
            className="carousel-image"
          />
          <div className="slogan-container">
            <div className="slogan-text">Safety makes flight, we make safety, hope your safe flight!</div>
          </div>
        </div>
      </Slider>
    </div>
  );
};

export default Carousel;
