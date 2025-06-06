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
            <p className="slogan-text">하늘 위에서 즐거운 여행이 될 수 있도록<br />
              여러분들의 준비를 도와드리겠습니다<br />
              EZPZ에 오신 걸 환영합니다.</p>
          </div>
        </div>
        <div className="carousel-slide">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=350&auto=format&fit=crop"
            alt="인기 여행지"
            className="carousel-image"
          />
          <div className="slogan-container">
            <p className="slogan-text">"Safety doesn't happen by accident,<br />it's created by effort."</p><br />
            <p className="slogan-text">-Mark Twain</p>
          </div>
        </div>
        <div className="carousel-slide">
          <img
            src="https://images.unsplash.com/photo-1499591934245-40b55745b905?w=1200&h=350&auto=format&fit=crop"
            alt="계절별 아이템"
            className="carousel-image"
          />
          <div className="slogan-container">
            <p className="slogan-text">Safety makes flight,<br />We make safety,<br />Hope your safe flight!</p>
          </div>
        </div>
      </Slider>
    </div>
  );
};

export default Carousel;
