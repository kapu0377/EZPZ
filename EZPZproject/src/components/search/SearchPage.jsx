import React, { useState, useEffect } from "react";
import SearchInput from "../SearchInput";
import SearchResults from "../SearchResults";
import Rankings from "../Rankings";
import { getUserSearchHistory } from "../../api/searchApi";
import "./SearchPage.css";

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState(() => {
    const savedResults = sessionStorage.getItem('searchResults');
    return savedResults ? JSON.parse(savedResults) : [];
  });
  
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("search"); 
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('searchResults', JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        setIsLoading(true);
        const username = localStorage.getItem('username');
        if (username) {
          const history = await getUserSearchHistory(username);
          setSearchHistory(history);
        }
      } catch (error) {
        console.error('검색 기록 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserHistory();
  }, []);

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
                {isLoading ? (
                  <p className="loading-text">검색 기록을 불러오는 중...</p>
                ) : searchHistory.length > 0 ? (
                  <div className="history-list">
                    {searchHistory.map((item, index) => (
                      <div key={index} className="history-item">
                        <span className="history-keyword">{item.keyword}</span>
                        <span className="history-date">{new Date(item.searchDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-history">검색 기록이 없습니다.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* <div className="rankings-container">
          <Rankings />
        </div> */}
      </div>
    </div>
  );
};

export default SearchPage;