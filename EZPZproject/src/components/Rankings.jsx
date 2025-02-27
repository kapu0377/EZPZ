import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {

  getDailyRankings,
  getWeeklyRankings,
  getMonthlyRankings,
} from '../api/searchApi';
import "./Rankings.css";
import arrow from '../assets/img/arrow.png';  // 화살표 이미지 추가

const Rankings = () => {
  const [rankings, setRankings] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [loading, setLoading] = useState(true);
  const [currentType, setCurrentType] = useState('daily');
  const MAX_DISPLAY_ITEMS = 5;
  
  const fetchAllRankings = async () => {
    try {
      setLoading(true);
      const [dailyData, weeklyData, monthlyData] = await Promise.all([
        getDailyRankings(),
        getWeeklyRankings(),
        getMonthlyRankings()
      ]);

      setRankings({
        daily: dailyData.sort((a, b) => b.count - a.count),
        weekly: weeklyData.sort((a, b) => b.count - a.count),
        monthly: monthlyData.sort((a, b) => b.count - a.count)
      });
    } catch (error) {
      console.error('랭킹 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRankings();
    
    // 랭킹 업데이트 이벤트 리스너
    const handleRankingsUpdate = (event) => {
      if (event.detail) {
        setRankings(prevRankings => ({
          ...prevRankings,
          daily: event.detail.sort((a, b) => b.count - a.count)
        }));
      }
    };

    window.addEventListener('rankingsUpdated', handleRankingsUpdate);
    const interval = setInterval(fetchAllRankings, 30000);

    return () => {
      window.removeEventListener('rankingsUpdated', handleRankingsUpdate);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentType(prev => {
        switch(prev) {
          case 'daily': return 'weekly';
          case 'weekly': return 'monthly';
          case 'monthly': return 'daily';
          default: return 'daily';
        }
      });
    }, 10000);

    return () => clearInterval(slideInterval);
  }, []);

  const handleTabClick = (type) => {
    setCurrentType(type);
  };

  if (loading) {
    // return <div className="rankings loading">로딩 중...</div>;
  }

  return (
    <div className="rankings">
      <div className="ranking-section">
        <div className="ranking-header">
          <h3>카테고리 검색 순위</h3>
          <Link to="/rankings" className="view-more-link">
            <img src={arrow} alt="더 보기" className="arrow-icon" />
          </Link>
        </div>
        <div className="tabs">
          <button
            className={`tab-button ${currentType === 'daily' ? 'active' : ''}`}
            onClick={() => handleTabClick('daily')}
          >
            일간
          </button>
          <button
            className={`tab-button ${currentType === 'weekly' ? 'active' : ''}`}
            onClick={() => handleTabClick('weekly')}
          >
            주간
          </button>
          <button
            className={`tab-button ${currentType === 'monthly' ? 'active' : ''}`}
            onClick={() => handleTabClick('monthly')}
          >
            월간
          </button>
        </div>
        
        <div className="ranking-list slide-container">
          <div className={`ranking-slide ${currentType}`}>
            {rankings[currentType].slice(0, MAX_DISPLAY_ITEMS).map((item, index) => (
              <div key={index} className="ranking-item">
                <span>{index + 1}. {item.name}</span>
                <span>{item.count}회</span>
              </div>
            ))}
            {rankings[currentType].length === 0 && 
              <div className="no-data">데이터가 없습니다.</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rankings;
