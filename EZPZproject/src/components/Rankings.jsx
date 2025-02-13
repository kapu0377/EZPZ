import React, { useState, useEffect } from 'react';
import { getSearchRankings } from '../api/searchApi';
import './Rankings.css';

const Rankings = () => {
  const [searchRankings, setSearchRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await getSearchRankings();
        console.log('서버에서 받은 순위 데이터:', data);
        if (!data || data.length === 0) {
          console.log('순위 데이터가 없습니다.');
          setSearchRankings([]);
        } else {
          setSearchRankings(data);
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

  useEffect(() => {
    return () => {
      setSearchRankings([]);
    };
  }, []);

  // 검색 직후 즉시 업데이트를 위한 이벤트 리스너
  useEffect(() => {
    const handleRankingsUpdate = (event) => {
      setSearchRankings(event.detail);
    };

    window.addEventListener('rankingsUpdated', handleRankingsUpdate);
    return () => {
      window.removeEventListener('rankingsUpdated', handleRankingsUpdate);
    };
  }, []);

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
                <span>{index + 1}. {item.name}</span>
                <span>{item.count}회</span>
              </div>
            ))
          ) : (
            <div>검색 기록이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rankings;