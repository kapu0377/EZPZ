import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AirportRating.css';

const AirportRating = ({ airport }) => {
  const [ratings, setRatings] = useState({
    satisfaction: 5,
    cleanliness: 5,
    convenience: 5,
    comment: ''
  });
  
  const [averageRatings, setAverageRatings] = useState(null);

  useEffect(() => {
    fetchAverageRatings();
  }, [airport.id]);

  const fetchAverageRatings = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/airports/${airport.id}/ratings/average`);
      setAverageRatings(response.data);
    } catch (error) {
      console.error('평균 평점 조회 실패:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/airports/${airport.id}/ratings`, ratings);
      alert('평가가 성공적으로 제출되었습니다!');
      fetchAverageRatings();
      setRatings({
        satisfaction: 5,
        cleanliness: 5,
        convenience: 5,
        comment: ''
      });
    } catch (error) {
      alert('평가 제출 실패');
    }
  };

  return (
    <div className="airport-rating-card">
      <h2>{airport.name}</h2>
      <div className="average-ratings">
        {averageRatings && (
          <>
            <p>평균 만족도: {averageRatings.avgSatisfaction.toFixed(1)}</p>
            <p>평균 청결도: {averageRatings.avgCleanliness.toFixed(1)}</p>
            <p>평균 편의성: {averageRatings.avgConvenience.toFixed(1)}</p>
          </>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="rating-group">
          <label>만족도</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={ratings.satisfaction}
            onChange={(e) => setRatings({...ratings, satisfaction: parseInt(e.target.value)})}
          />
          <span>{ratings.satisfaction}</span>
        </div>

        <div className="rating-group">
          <label>청결도</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={ratings.cleanliness}
            onChange={(e) => setRatings({...ratings, cleanliness: parseInt(e.target.value)})}
          />
          <span>{ratings.cleanliness}</span>
        </div>

        <div className="rating-group">
          <label>편의성</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={ratings.convenience}
            onChange={(e) => setRatings({...ratings, convenience: parseInt(e.target.value)})}
          />
          <span>{ratings.convenience}</span>
        </div>

        <button type="submit">평가 제출</button>
      </form>
    </div>
  );
};

export default AirportRating;