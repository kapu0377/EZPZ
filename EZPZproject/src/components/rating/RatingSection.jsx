import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import './RatingSection.css';

const StarRating = ({ rating, setRating, label }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="star-rating">
      <label>{label}</label>
      <div className="stars">
        {[...Array(5)].map((star, index) => {
          const ratingValue = index + 1;
          return (
            <label key={index}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => setRating(ratingValue)}
              />
              <FaStar
                className="star"
                size={30}
                color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(null)}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
};

const RatingSection = ({ airport }) => {
  const [ratings, setRatings] = useState({
    satisfaction: 0,
    cleanliness: 0,
    convenience: 0,
    comment: ''
  });
  const [averageRatings, setAverageRatings] = useState(null);

  useEffect(() => {
    if (airport) {
      fetchAverageRatings(airport.id || 'ICN');
    }
  }, [airport]);

  const fetchAverageRatings = async (airportId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/airports/${airportId}/ratings/average`);
      setAverageRatings(response.data);
    } catch (error) {
      console.error('평균 평점 조회 실패:', error);
    }
  };

  const handleRatingSubmit = async () => {
    if (!ratings.satisfaction || !ratings.cleanliness || !ratings.convenience) {
      alert('모든 항목을 평가해주세요.');
      return;
    }

    try {
      const airportId = airport.id || 'ICN';
      // 5점 만점을 10점 만점으로 변환
      const convertedRatings = {
        ...ratings,
        satisfaction: ratings.satisfaction * 2,
        cleanliness: ratings.cleanliness * 2,
        convenience: ratings.convenience * 2
      };
      
      await axios.post(`http://localhost:8080/api/airports/${airportId}/ratings`, convertedRatings);
      alert('평가가 성공적으로 제출되었습니다!');
      fetchAverageRatings(airportId);
      setRatings({
        satisfaction: 0,
        cleanliness: 0,
        convenience: 0,
        comment: ''
      });
    } catch (error) {
      alert('평가 제출에 실패했습니다.');
    }
  };

  return (
    <div className="airport-rating-section">
      <h2>{airport ? (airport.name || '인천국제공항') : ''} 이용 만족도 평가</h2>
      
      {/* {averageRatings && (
        <div className="average-ratings">
          <h3>평균 평점</h3>
          <div className="ratings-grid">
            <div className="rating-item">
              <span>전반적 만족도:</span>
              <span>{(averageRatings.avgSatisfaction / 2).toFixed(1)} / 5.0</span>
            </div>
            <div className="rating-item">
              <span>청결도:</span>
              <span>{(averageRatings.avgCleanliness / 2).toFixed(1)} / 5.0</span>
            </div>
            <div className="rating-item">
              <span>이용 편의성:</span>
              <span>{(averageRatings.avgConvenience / 2).toFixed(1)} / 5.0</span>
            </div>
          </div>
        </div>
      )} */}

      <div className="rating-form">
        <div className="rating-inputs">
          <StarRating
            rating={ratings.satisfaction}
            setRating={(value) => setRatings({...ratings, satisfaction: value})}
            label="전반적 만족도"
          />
          <StarRating
            rating={ratings.cleanliness}
            setRating={(value) => setRatings({...ratings, cleanliness: value})}
            label="청결도"
          />
          <StarRating
            rating={ratings.convenience}
            setRating={(value) => setRatings({...ratings, convenience: value})}
            label="이용 편의성"
          />
        </div>

        {/* <textarea
          placeholder="추가 의견을 입력해주세요"
          value={ratings.comment}
          onChange={(e) => setRatings({...ratings, comment: e.target.value})}
        /> */}

        <button 
          className="submit-rating-button"
          onClick={handleRatingSubmit}
        >
          평가 제출하기
        </button>
      </div>
    </div>
  );
};

export default RatingSection;