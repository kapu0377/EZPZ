import React, { useState, useEffect } from 'react';
import { fetchPreviewParkingData } from '../../api/parking/PreviewApi';
<<<<<<< HEAD
=======
import { fetchICNParkingData } from '../../api/parking/ICNPreviewApi';
>>>>>>> main
import './ParkingSlider.css';

const ParkingSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
<<<<<<< HEAD
        const data = await fetchPreviewParkingData();
        console.log('일반 공항 데이터:', data);
        setParkingData(data);
=======
        setError(null);
  
        let allAirportsData = [];
        
        try {
          const icnDataArray = await fetchICNParkingData(); // T1, T2 데이터 배열로 받음
          console.log('인천공항 데이터:', icnDataArray);
          if (icnDataArray && Array.isArray(icnDataArray)) {
            allAirportsData.push(...icnDataArray); // 배열 spread로 추가
          }
        } catch (icnError) {
          console.error('인천공항 데이터 로딩 에러:', icnError);
        }
  
        try {
          const otherData = await fetchPreviewParkingData();
          console.log('일반 공항 데이터:', otherData);
          if (otherData && Array.isArray(otherData)) {
            allAirportsData = [...allAirportsData, ...otherData];
          }
        } catch (otherError) {
          console.error('일반 공항 데이터 로딩 에러:', otherError);
        }
  
        if (allAirportsData.length === 0) {
          throw new Error('공항 주차장 데이터를 불러오는데 실패했습니다.');
        }
  
        setParkingData(allAirportsData);
>>>>>>> main
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error('데이터 로딩 에러:', err);
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD

=======
  
>>>>>>> main
    loadData();
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);
<<<<<<< HEAD
=======
  ;

>>>>>>> main

  useEffect(() => {
    if (parkingData.length > 0) {
      const slideInterval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === parkingData.length - 1 ? 0 : prevIndex + 1
        );
<<<<<<< HEAD
      }, 5000);
=======
      }, 10000);
>>>>>>> main

      return () => clearInterval(slideInterval);
    }
  }, [parkingData.length]);

  const getStatusClass = (status) => {
    switch (status) {
      case '만차': return 'full';
      case '혼잡': return 'busy';
      default: return 'available';
    }
  };

  const formatParkingInfo = (lot) => {
    // 실제 남은 주차면수 계산
    const remainingSpots = lot.totalSpots - (lot.totalSpots * (lot.occupancyRate / 100));
    return Math.round(remainingSpots); // 소수점 반올림
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
            <div className="parking-info-row">
              <span className="parking-name">{lot.name}</span>
              <div className="parking-status">
                <span className={`status-badge ${getStatusClass(lot.status)}`}>
                  {lot.status}
                </span>
                <span className="available-spots">
                  {formatParkingInfo(lot)}대 주차가능
                </span>
              </div>
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

export default ParkingSlider;