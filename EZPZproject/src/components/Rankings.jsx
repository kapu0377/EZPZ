import React, { useState, useEffect } from 'react';
import { getSearchRankings, getDetectionRankings } from '../api/searchApi';

const Rankings = () => {
  const [searchRankings, setSearchRankings] = useState([]);
  const [detectionRankings, setDetectionRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const [searchData, detectionData] = await Promise.all([
          getSearchRankings(),
          getDetectionRankings()
        ]);
        setSearchRankings(searchData);
        setDetectionRankings(detectionData);
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
    const interval = setInterval(fetchRankings, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="rankings">
      <div className="ranking-section">
        <h3>검색 랭킹</h3>
        <div className="ranking-list">
          {searchRankings.map((item, index) => (
            <div key={index} className="ranking-item">
              <span>{index + 1}. {item.name}</span>
              <span>{item.count}회</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ranking-section">
        <h3>적발 랭킹</h3>
        <div className="ranking-list">
          {detectionRankings.map((item, index) => (
            <div key={index} className="ranking-item">
              <span>{index + 1}. {item.name}</span>
              <span>{item.count}건</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rankings;