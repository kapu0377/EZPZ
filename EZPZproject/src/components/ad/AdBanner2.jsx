import React, { useState, useEffect } from 'react';
import './AdBanner.css';

const AdBanner = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // 광고 배너 데이터
  const banners = [
    {
      id: 1,
      imageUrl: '/banner1.jpg',
      link: '#',
      alt: '광고 배너 1'
    },
    {
      id: 2,
      imageUrl: '/banner2.jpg',
      link: '#',
      alt: '광고 배너 2'
    },
    {
      id: 3,
      imageUrl: '/banner3.jpg',
      link: '#',
      alt: '광고 배너 3'
    }
  ];

  // 자동 슬라이드 효과
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5초마다 변경

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ad-banner">
      <div className="banner-container">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`banner-item ${index === currentBannerIndex ? 'active' : ''}`}
          >
            <a href={banner.link} target="_blank" rel="noopener noreferrer">
              <img src={banner.imageUrl} alt={banner.alt} />
            </a>
          </div>
        ))}
      </div>
      <div className="banner-dots">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentBannerIndex ? 'active' : ''}`}
            onClick={() => setCurrentBannerIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default AdBanner;