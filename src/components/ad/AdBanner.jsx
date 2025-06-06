import React from 'react';
import './AdBanner.css';
import ad1 from '../../assets/img/ad1.jpg';

const AdBanner = () => {
  const banner = {
    imageUrl: '/ad1.jpg', 
    link: '#',  
    alt: '광고 배너'
  };

  return (
    <div className="ad-banner">
      <a href={banner.link} target="_blank" rel="noopener noreferrer">
        {/* <img src={banner.imageUrl} alt={banner.alt} /> */}
        <img src={ad1} alt={banner.alt} />
      </a>
    </div>
  );
};

export default AdBanner;