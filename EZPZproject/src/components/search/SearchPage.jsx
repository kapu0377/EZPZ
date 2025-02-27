import React, { useState, useEffect } from "react";
import SearchInput from "../SearchInput";
import SearchResults from "../SearchResults";
import Login from "../Login"; 
import { getUserSearchHistory, getUserSearchHistoryByDays } from "../../api/searchApi";
import "./SearchPage.css";

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState(() => {
    const savedResults = sessionStorage.getItem('searchResults');
    return savedResults ? JSON.parse(savedResults) : [];
  });
  
  const [searchHistory, setSearchHistory] = useState([]);
  const [groupedHistory, setGroupedHistory] = useState({});
  const [activeTab, setActiveTab] = useState("search"); 
  const [isLoading, setIsLoading] = useState(false);
  const [historyDays, setHistoryDays] = useState(7); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 

  useEffect(() => {
    sessionStorage.setItem('searchResults', JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    const username = localStorage.getItem('username');
    setIsLoggedIn(!!username);

    const fetchUserHistory = async () => {
      try {
        setIsLoading(true);
        if (username) {
          const history = await getUserSearchHistoryByDays(username, historyDays);
          setSearchHistory(history);
          
          const grouped = history.reduce((acc, item) => {
            const date = new Date(item.searchDate).toLocaleDateString();
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(item);
            return acc;
          }, {});
          
          setGroupedHistory(grouped);
        }
      } catch (error) {
        console.error('검색 기록 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchUserHistory();
    }
  }, [historyDays, activeTab]);

  useEffect(() => {
    const handleLoginSuccess = () => {
      setIsLoggedIn(true);
      const username = localStorage.getItem('username');
      if (username) {
        const fetchUserHistory = async () => {
          try {
            setIsLoading(true);
            const history = await getUserSearchHistoryByDays(username, historyDays);
            setSearchHistory(history);
            
            const grouped = history.reduce((acc, item) => {
              const date = new Date(item.searchDate).toLocaleDateString();
              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push(item);
              return acc;
            }, {});
            
            setGroupedHistory(grouped);
          } catch (error) {
            console.error('검색 기록 로딩 실패:', error);
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchUserHistory();
      }
    };

    window.addEventListener('login-success', handleLoginSuccess);
    return () => window.removeEventListener('login-success', handleLoginSuccess);
  }, [historyDays]);

  const handleSearchResult = (result) => {
    setSearchResults(prev => {
      if (prev.length >= 10) {
        return [...prev.slice(1), result];
      }
      return [...prev, result];
    });
    setActiveTab("search");
  };

  const handleRemoveItem = (index) => {
    setSearchResults(prev => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSearchResults([]);
    sessionStorage.removeItem('searchResults');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDaysChange = (days) => {
    setHistoryDays(days);
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <div className="search-page">
      <div className="description-section2">
        <h1>항공기 반입 물품 검색</h1>
        <p>항공기에 반입 가능한 물품을 검색하고 결과를 확인하세요.</p>
      </div>

      <div className="search-container">
        <div className="search-input-container">
          <SearchInput 
            onSearchResult={handleSearchResult} 
            onReset={handleReset}
          />
        </div>

        <div className="search-content">
          <div className="search-tabs">
            <button 
              className={`tab-button ${activeTab === "search" ? "active" : ""}`}
              onClick={() => handleTabChange("search")}
            >
              검색 결과
            </button>
            <button 
              className={`tab-button ${activeTab === "history" ? "active" : ""}`}
              onClick={() => handleTabChange("history")}
            >
              내 검색 기록
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "search" ? (
              <div className="search-results-container">
                <SearchResults 
                  results={searchResults} 
                  onRemoveItem={handleRemoveItem}
                />
              </div>
            ) : (
              <div className="search-history-container">
                <h3>내 검색 기록</h3>
                
                {!isLoggedIn ? (
                  <div className="login-required-message">
                    <p>검색 기록을 보려면 로그인이 필요합니다.</p>
                    <button 
                      className="login-button"
                      onClick={handleOpenLoginModal}
                    >
                      로그인하기
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="history-controls">
                      <label>검색 기록 저장 기간: </label>
                      <select 
                        value={historyDays}
                        onChange={(e) => handleDaysChange(parseInt(e.target.value))}
                      >
                        <option value={5}>5일</option>
                        <option value={7}>7일</option>
                        <option value={10}>10일</option>
                      </select>
                    </div>
                    {isLoading ? (
                      <p className="loading-text">검색 기록을 불러오는 중...</p>
                    ) : Object.keys(groupedHistory).length > 0 ? (
                      <div className="grouped-history-list">
                        {Object.entries(groupedHistory)
                          .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                          .map(([date, items]) => (
                            <div key={date} className="history-date-group">
                              <h4 className="history-date-header">{date}</h4>
                              <div className="history-date-items">
                                {items.map((item, idx) => (
                                  <div key={idx} className="history-item">
                                    <span className="history-keyword">{item.keyword}</span>
                                    <span className="history-time">{new Date(item.searchDate).toLocaleTimeString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="no-history">검색 기록이 없습니다.</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Login isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </div>
  );
};

export default SearchPage;