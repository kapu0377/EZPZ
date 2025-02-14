import React, { useState } from 'react';
import AirportCard from '../components/parking/AirportCard';
import '../components/parking/AirportParking.css';
import { fetchAirportParkingData, AIRPORT_CODES } from '../api/parking/ParkingApi';
import { fetchIncheonParkingData } from '../api/parking/ICNParkingApi';

const AirportParkingPage = () => {
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [incheonData, setIncheonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAirportData = async (airportCode) => {
    // 이미 선택된 공항을 다시 클릭한 경우 데이터를 숨김
    if (selectedAirport?.id === airportCode) {
      setSelectedAirport(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAirportParkingData(airportCode);
      setSelectedAirport(data);
      setIncheonData(null); // 인천공항 데이터 초기화
    } catch (err) {
      setError(`${AIRPORT_CODES[airportCode].name} 데이터를 불러오는데 실패했습니다.`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIncheonData = async () => {
    // 인천공항 데이터가 이미 있으면 숨김
    if (incheonData) {
      setIncheonData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchIncheonParkingData();
      setIncheonData(data);
      setSelectedAirport(null); // 다른 공항 데이터 초기화
    } catch (err) {
      setError('인천공항 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCongestionColor = (occupancy) => {
    if (occupancy >= 80) return '#ff4d4d';
    if (occupancy >= 50) return '#ffd700';
    return '#4CAF50';
  };

  return (
    <div className="airport-parking-container" style={{ minHeight: 'calc(100vh - 400px)' }}>
      <h1>전국 공항 주차장 현황</h1>
      
      <div className="airport-buttons">
        <button
          onClick={loadIncheonData}
          className={`airport-button ${incheonData ? 'active' : ''}`}
        >
          인천국제공항
        </button>
        {Object.values(AIRPORT_CODES).map(airport => (
          <button
            key={airport.code}
            onClick={() => loadAirportData(airport.code)}
            className={`airport-button ${selectedAirport?.id === airport.code ? 'active' : ''}`}
          >
            {airport.name}
          </button>
        ))}
      </div>

      {isLoading && <div className="loading">데이터를 불러오는 중입니다...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="airports-grid">
        {selectedAirport && (
          <AirportCard
            airport={selectedAirport}
            getCongestionColor={getCongestionColor}
          />
        )}
        {incheonData && incheonData.map(terminal => (
          <AirportCard
            key={terminal.id}
            airport={terminal}
            getCongestionColor={getCongestionColor}
          />
        ))}
      </div>
    </div>
  );
};

export default AirportParkingPage;