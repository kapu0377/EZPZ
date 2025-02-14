import React, { useState, useEffect } from 'react';
import { fetchPreviewParkingData } from '../../api/parking/PreviewApi';
import './AirportParkingSlider.css';

const AirportParkingSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPreviewParkingData();
        console.log('일반 공항 데이터:', data);
        setParkingData(data);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error('데이터 로딩 에러:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (parkingData.length > 0) {
      const slideInterval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === parkingData.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(slideInterval);
    }
  }, [parkingData.length]);

  const getStatusColor = (occupancy) => {
    if (occupancy >= 100) return '#ff4b4b';
    if (occupancy >= 70) return '#ffa502';
    return '#4b7bec';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case '만차': return 'full';
      case '혼잡': return 'busy';
      default: return 'available';
    }
  };

  if (loading) return <div className="loading">데이터를 불러오는 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!parkingData || parkingData.length === 0) return <div>주차장 정보가 없습니다.</div>;

  const currentAirport = parkingData[currentIndex];

  return (
    <div className="airport-parking-card">
      <h2>공항 별 주차현황</h2>
      <div className="airport-content">
        <h3>{currentAirport?.airportName}</h3>
        {currentAirport?.parkingLots?.map((lot, index) => (
          <div key={index} className="parking-area">
            <span>{lot.name}</span>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{
                  width: `${Math.min(lot.occupancyRate, 100)}%`,
                  backgroundColor: getStatusColor(lot.occupancyRate)
                }}
              />
            </div>
            <div className="parking-info">
              <span className="parking-numbers">
                {lot.availableSpots} / {lot.totalSpots}
              </span>
              <span className={`status-badge ${getStatusClass(lot.status)}`}>
                {lot.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="slider-dots">
        {parkingData.map((_, index) => (
          <span 
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default AirportParkingSlider;