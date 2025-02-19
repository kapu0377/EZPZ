import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AirportRating from './AirportRating';
import './AirportList.css';

const AirportList = () => {
  const [airports, setAirports] = useState([]);

  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/airports');
      setAirports(response.data);
    } catch (error) {
      console.error('공항 목록 조회 실패:', error);
    }
  };

  return (
    <div className="airport-list">
      <h1>공항별 만족도 평가</h1>
      <div className="airports-grid">
        {airports.map(airport => (
          <AirportRating key={airport.id} airport={airport} />
        ))}
      </div>
    </div>
  );
};

export default AirportList;