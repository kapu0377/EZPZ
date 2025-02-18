import React, { useState, useEffect } from 'react';
import {
  getSearchRankings,
  getDailyRankings,
  getWeeklyRankings,
  getMonthlyRankings,} from '../api/searchApi';
import './Rankings.css';

const Rankings = () => {
  const [searchRankings, setSearchRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extendedRankings, setExtendedRankings] = useState([]);
  const [rankingType, setRankingType] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const MAX_DISPLAY_ITEMS = 6;

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await getSearchRankings();
        console.log('서버에서 받은 순위 데이터:', data);
        if (!data || data.length === 0) {
          console.log('순위 데이터가 없습니다.');
          setSearchRankings([]);
        } else {
          setSearchRankings(data.slice(0, MAX_DISPLAY_ITEMS));
        }
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
        setSearchRankings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
    const interval = setInterval(fetchRankings, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchExtendedRankings = async (type) => {
    try {
      let data = [];
      if (type === 'daily') {
        data = await getDailyRankings();
      } else if (type === 'weekly') {
        data = await getWeeklyRankings();
      } else if (type === 'monthly') {
        data = await getMonthlyRankings();
      }
      setExtendedRankings(data);
    } catch (error) {
      console.error(`Failed to fetch ${type} rankings:`, error);
      setExtendedRankings([]);
    }
  };

  const handleMoreClick = () => {
    setIsModalOpen(true);
    setRankingType('daily');
    fetchExtendedRankings('daily');
  };

  const handleTabClick = (type) => {
    setRankingType(type);
    fetchExtendedRankings(type);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="rankings">
      <div className="ranking-section">
        <h3>카테고리 검색 순위</h3>
        <div className="ranking-list">
          {searchRankings && searchRankings.length > 0 ? (
            searchRankings.map((item, index) => (
              <div key={index} className="ranking-item">
                <span>
                  {index + 1}. {item.name}
                </span>
                <span>{item.count}회</span>
              </div>
            ))
          ) : (
            <div>검색 기록이 없습니다.</div>
          )}
        </div>
        <button className="rankingmore-button" onClick={handleMoreClick}>더보기</button>
        </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span
              className="close-button"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </span>
            <div className="tabs">
              <button
                className={rankingType === 'daily' ? 'active' : ''}
                onClick={() => handleTabClick('daily')}
              >
                일간
              </button>
              <button
                className={rankingType === 'weekly' ? 'active' : ''}
                onClick={() => handleTabClick('weekly')}
              >
                주간
              </button>
              <button
                className={rankingType === 'monthly' ? 'active' : ''}
                onClick={() => handleTabClick('monthly')}
              >
                월간
              </button>
            </div>
            <div className="extended-ranking-list">
              {extendedRankings && extendedRankings.length > 0 ? (
                extendedRankings.map((item, index) => (
                  <div key={index} className="ranking-item">
                    <span>{index + 1}. {item.category}</span>
                    <span>{item.searchCount}회</span>
                  </div>
                ))
              ) : (
                <div>데이터가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rankings;
