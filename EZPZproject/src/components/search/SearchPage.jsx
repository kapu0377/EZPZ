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
  
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem('currentSearchPage');
    return savedPage ? parseInt(savedPage) : 1;
  });
  const [resultsPerPage] = useState(10);
  
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
    sessionStorage.setItem('currentSearchPage', currentPage);
  }, [currentPage]);

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

  useEffect(() => {
    const handleSearchHistoryUpdated = async () => {
      const username = localStorage.getItem('username');
      if (username) {
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
      }
    };

    window.addEventListener('search-history-updated', handleSearchHistoryUpdated);
    return () => window.removeEventListener('search-history-updated', handleSearchHistoryUpdated);
  }, [historyDays]);

  const handleSearchResult = (result) => {
    setSearchResults(prev => [...prev, result]);
    
    // 새 결과가 추가되면 해당 페이지로 이동
    setCurrentPage(Math.ceil((searchResults.length + 1) / resultsPerPage));
    
    // 현재 탭이 history일 경우 알림 표시
    if (activeTab === "history") {
      setShowSearchNotification(true);
      // 3초 후 알림 자동 제거
      setTimeout(() => {
        setShowSearchNotification(false);
      }, 3000);
    }
  };

  const handleRemoveItem = (index) => {
    // 현재 페이지에 표시된 결과의 실제 인덱스 계산
    const actualIndex = indexOfFirstResult + index;
    setSearchResults(prev => prev.filter((_, i) => i !== actualIndex));
    
    // 현재 페이지에 결과가 없게 되면 이전 페이지로 이동
    const newTotalPages = Math.ceil((searchResults.length - 1) / resultsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handleReset = () => {
    setSearchResults([]);
    setCurrentPage(1);
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
  
  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 현재 페이지에 표시할 검색 결과 계산
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult);
  
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(searchResults.length / resultsPerPage);

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
                  results={currentResults} 
                  onRemoveItem={handleRemoveItem}
                />
                
                {/* 페이지네이션 컨트롤 추가 */}
                {searchResults.length > 0 && (
                  <div className="pagination">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      이전
                    </button>
                    
                    <span className="page-info">{currentPage} / {totalPages || 1}</span>
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="pagination-button"
                    >
                      다음
                    </button>
                  </div>
                )}
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