import React, { useState, useEffect } from 'react';
import { getDailyRankings, getWeeklyRankings, getMonthlyRankings } from '../../api/searchApi';
import { Helmet } from 'react-helmet-async';
import "../../components/Rankings.css";
import "./RankingsPage.css";
const RankingsPage = () => {
  const [rankings, setRankings] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [loading, setLoading] = useState(true);
  const [currentType, setCurrentType] = useState('daily');
  const MAX_DISPLAY_ITEMS = 20; 
  
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

  const handleTabClick = (type) => {
    setCurrentType(type);
  };

  return (
    <div className="rankings-page">
      <Helmet>
        <title>검색 순위 | EZPZ</title>
        <meta name="description" content="EZPZ 카테고리 검색 순위 - 일간, 주간, 월간 인기 검색어를 확인하세요." />
      </Helmet>
      
      <div className="description-section2">
        <h1>카테고리 검색 순위</h1>
        <p>사용자들이 가장 많이 검색한 카테고리를 확인해보세요</p>
      </div>

      <div className="rankings-container">
        <div className="rankings-tabs">
          <button
            className={`tab-button ${currentType === 'daily' ? 'active' : ''}`}
            onClick={() => handleTabClick('daily')}
          >
            일간 순위
          </button>
          <button
            className={`tab-button ${currentType === 'weekly' ? 'active' : ''}`}
            onClick={() => handleTabClick('weekly')}
          >
            주간 순위
          </button>
          <button
            className={`tab-button ${currentType === 'monthly' ? 'active' : ''}`}
            onClick={() => handleTabClick('monthly')}
          >
            월간 순위
          </button>
        </div>
        
        <div className="rankings-content">
          {loading ? (
            <div className="rankings-loading">
              <div className="spinner"></div>
              <p>랭킹 데이터를 불러오는 중입니다...</p>
            </div>
          ) : (
            <>
              <div className="rankings-date">
                {currentType === 'daily' && <p>오늘의 인기 검색어</p>}
                {currentType === 'weekly' && <p>이번 주 인기 검색어</p>}
                {currentType === 'monthly' && <p>이번 달 인기 검색어</p>}
              </div>
              
              <div className="rankings-list-full">
                {rankings[currentType].length > 0 ? (
                  rankings[currentType].slice(0, MAX_DISPLAY_ITEMS).map((item, index) => (
                    <div key={index} className="ranking-item-full">
                      <div className="ranking-number">{index + 1}</div>
                      <div className="ranking-name">{item.name}</div>
                      <div className="ranking-count">{item.count.toLocaleString()}회</div>
                    </div>
                  ))
                ) : (
                  <div className="no-data">데이터가 없습니다.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingsPage;