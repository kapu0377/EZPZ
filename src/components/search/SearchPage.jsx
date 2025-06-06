import React, { useState, useEffect } from "react";
import SearchInput from "../SearchInput";
import SearchResults from "../SearchResults";
import Login from "../Login"; 
import { getUserSearchHistory, getUserSearchHistoryByDays } from "../../api/searchApi";
import { useAuth } from "../../contexts/AuthContext";
import "./SearchPage.css";

const SearchPage = () => {
  const { getCurrentUser, isAuthenticated } = useAuth();
  const [searchResults, setSearchResults] = useState(() => {
    const savedResults = sessionStorage.getItem('searchResults');
    return savedResults ? JSON.parse(savedResults) : [];
  });
  
  const [searchHistory, setSearchHistory] = useState(() => {
    const savedHistory = sessionStorage.getItem('searchHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [groupedHistory, setGroupedHistory] = useState(() => {
    const savedGroupedHistory = sessionStorage.getItem('groupedHistory');
    return savedGroupedHistory ? JSON.parse(savedGroupedHistory) : {};
  });
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('activeTab');
    return savedTab || "search";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [historyDays, setHistoryDays] = useState(7); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 
  const [showSearchNotification, setShowSearchNotification] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState({}); 
 
  useEffect(() => {
    sessionStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);
  
  useEffect(() => {
    sessionStorage.setItem('groupedHistory', JSON.stringify(groupedHistory));
  }, [groupedHistory]);

  useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);
  
  useEffect(() => {
    sessionStorage.setItem('searchResults', JSON.stringify(searchResults));
  }, [searchResults]);  

  useEffect(() => {
    const initializePage = async () => {
      try {
        const user = getCurrentUser();
        const authenticated = isAuthenticated;
        
        console.log('SearchPage 인증 상태:', {
          authenticated,
          user,
          userExists: !!user
        });

        if (authenticated && user) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
        
        const fetchUserHistory = async () => {
          try {
            setIsLoading(true);
            if (user && user.username) {
              const history = await getUserSearchHistoryByDays(user.username, historyDays);
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

        if (authenticated && user) {
          await fetchUserHistory();
        }
      } catch (error) {
        console.error('검색 페이지 초기화 실패:', error);
      }
    };

    initializePage();
  }, [getCurrentUser, isAuthenticated, historyDays, activeTab]);

  useEffect(() => {
    const handleLoginSuccess = () => {
      const user = getCurrentUser();
      setIsLoggedIn(isAuthenticated && !!user);
      
      if (user && user.username) {
        const fetchUserHistory = async () => {
          try {
            setIsLoading(true);
            const history = await getUserSearchHistoryByDays(user.username, historyDays);
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
  }, [getCurrentUser, isAuthenticated, historyDays]);

  useEffect(() => {
    const handleSearchHistoryUpdated = async () => {
      const user = getCurrentUser();
      if (user && user.username) {
        try {
          setIsLoading(true);
          const history = await getUserSearchHistoryByDays(user.username, historyDays);
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
      }
    };

    window.addEventListener('search-history-updated', handleSearchHistoryUpdated);
    return () => window.removeEventListener('search-history-updated', handleSearchHistoryUpdated);
  }, [getCurrentUser, historyDays]);

  const handleSearchResult = (result) => {
    setSearchResults(prev => {
      let newResults = [...prev, result];
      if (newResults.length > 3) {
        newResults = newResults.slice(1);
      }
      return newResults;
    });
    
    if (activeTab === "history") {
      setShowSearchNotification(true);
      setTimeout(() => {
        setShowSearchNotification(false);
      }, 3000);
    }
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
    setVisibleItemsCount({}); 
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };
  
  const handleLoadMore = (date) => {
    setVisibleItemsCount(prev => ({
      ...prev,
      [date]: (prev[date] || 10) + 10
    }));
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
              className={`tab-button ${activeTab === "history" ? "active" : ""} ${showSearchNotification && activeTab === "history" ? "notification" : ""}`}
              onClick={() => handleTabChange("history")}
            >
              검색 기록 {showSearchNotification && activeTab === "history" && <span className="notification-dot"></span>}
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
                          .map(([date, items]) => {
                            const itemsToShow = Math.min(visibleItemsCount[date] || 10, items.length);
                            
                            return (
                              <div key={date} className="history-date-group">
                                <h4 className="history-date-header">{date}</h4>
                                <div className="history-date-items">
                                  {items.slice(0, itemsToShow).map((item, idx) => (
                                    <div key={idx} className="history-item">
                                      <span className="history-keyword">{item.keyword}</span>
                                      <span className="history-time">{new Date(item.searchDate).toLocaleTimeString()}</span>
                                    </div>
                                  ))}
                                  
                                  {items.length > itemsToShow && (
                                    <div className="history-item load-more-link">
                                      <span 
                                        className="load-more-text" 
                                        onClick={() => handleLoadMore(date)}
                                      >
                                        더보기
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="no-history">검색 기록이 없습니다.</p>
                    )}
                    {showSearchNotification && (
                      <p className="search-notification">새로운 검색 결과가 있습니다!</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isLoginModalOpen && (
        <Login onClose={handleCloseLoginModal} />
      )}
      
      {showSearchNotification && activeTab === "history" && (
        <div className="search-notification">
          <span>새로운 검색 결과가 있습니다. 검색 결과 탭에서 확인하세요!</span>
          <button onClick={() => handleTabChange("search")}>확인하기</button>
          <button onClick={() => setShowSearchNotification(false)}>×</button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;