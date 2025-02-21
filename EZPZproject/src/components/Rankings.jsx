import React, { useState, useEffect } from 'react';
import {
  searchItems,
  getSearchRankings,
  getDailyRankings,
  getWeeklyRankings,
  getMonthlyRankings,
  refreshRankings 
} from '../api/searchApi';
import "./Rankings.css";
const Rankings = () => {
  const [searchRankings, setSearchRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extendedRankings, setExtendedRankings] = useState([]);
  const [rankingType, setRankingType] = useState('daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const MAX_DISPLAY_ITEMS = 6;

  const fetchRankings = async () => {
    try {
      const data = await getSearchRankings();
      const sortedData = data.sort((a, b) => b.count - a.count);
      setSearchRankings(sortedData);
      return sortedData; // 정렬된 데이터 반환
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
      setSearchRankings([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []); 

  const handleSearch = async (query) => {
    try {
      await searchItems(query);
      await refreshRankings();
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
    }
  };

  const fetchExtendedRankings = async (type) => {
    try {
      let data = [];
      if (type === 'daily') {
        // 일별 순위는 전체 검색 순위 데이터를 그대로 사용
        data = searchRankings;
      } else if (type === 'weekly') {
        data = await getWeeklyRankings();
        data = data.sort((a, b) => b.searchCount - a.searchCount);
      } else if (type === 'monthly') {
        data = await getMonthlyRankings();
        data = data.sort((a, b) => b.searchCount - a.searchCount);
      }
      setExtendedRankings(data);
    } catch (error) {
      console.error(`Failed to fetch ${type} rankings:`, error);
      setExtendedRankings([]);
    }
  };

  const handleMoreClick = async () => {
    setIsModalOpen(true);
    setRankingType('daily');
    // 일별 데이터는 현재 searchRankings를 그대로 사용
    setExtendedRankings(searchRankings);
  };

  const handleTabClick = (type) => {
    setRankingType(type);
    fetchExtendedRankings(type);
  };

  return (
    <div className="rankings">
      <div className="ranking-section">
        <h3>카테고리 검색 순위</h3>
        <div className="ranking-list">
          {searchRankings.slice(0, MAX_DISPLAY_ITEMS).map((item, index) => (
            <div key={index} className="ranking-item">
              <span>{index + 1}. {item.name}</span>
              <span>{item.count}회</span>
            </div>
          ))}
          {searchRankings.length === 0 && <div>검색 기록이 없습니다.</div>}
        </div>
        <button className="rankingmore-button" onClick={handleMoreClick}>더보기</button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={() => setIsModalOpen(false)}>
              &times;
            </span>
            <div className="tabs">
              <button
                className={`tab-button ${rankingType === 'daily' ? 'active' : ''}`}
                onClick={() => handleTabClick('daily')}
              >
                일간
              </button>
              <button
                className={`tab-button ${rankingType === 'weekly' ? 'active' : ''}`}
                onClick={() => handleTabClick('weekly')}
              >
                주간
              </button>
              <button
                className={`tab-button ${rankingType === 'monthly' ? 'active' : ''}`}
                onClick={() => handleTabClick('monthly')}
              >
                월간
              </button>
            </div>
            <div className="extended-ranking-list">
              {rankingType === 'daily' ? (
                // 일별 순위 표시 (전체 검색 순위)
                extendedRankings.map((item, index) => (
                  <div key={index} className="ranking-item">
                    <span>{index + 1}. {item.name}</span>
                    <span>{item.count}회</span>
                  </div>
                ))
              ) : (
                // 주간/월간 순위 표시
                extendedRankings.map((item, index) => (
                  <div key={index} className="ranking-item">
                    <span>{index + 1}. {item.category}</span>
                    <span>{item.searchCount}회</span>
                  </div>
                ))
              )}
              {extendedRankings.length === 0 && <div>데이터가 없습니다.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rankings;
