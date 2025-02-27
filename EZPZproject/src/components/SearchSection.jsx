import React, { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import Rankings from "./Rankings";

const SearchSection = () => {
  const [searchResults, setSearchResults] = useState(() => {
    const savedResults = sessionStorage.getItem('searchResults');
    return savedResults ? JSON.parse(savedResults) : [];
  });

  const [news, setNews] = useState([]);

  useEffect(() => {
    sessionStorage.setItem('searchResults', JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    // 🛠 실제 뉴스 API를 여기에 추가해야 합니다.
    fetch("https://newsapi.org/v2/everything?q=aviation&apiKey=YOUR_NEWS_API_KEY")
      .then(response => response.json())
      .then(data => {
        setNews(data.articles.slice(0, 5)); // 최신 뉴스 5개만 가져오기
      })
      .catch(error => console.error("Error fetching news:", error));
  }, []);

  const handleSearchResult = (result) => {
    setSearchResults(prev => {
      if (prev.length >= 2) {
        return [...prev.slice(1), result];
      }
      return [...prev, result];
    });
  };

  const handleRemoveItem = (index) => {
    setSearchResults(prev => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSearchResults([]);
    sessionStorage.removeItem('searchResults');
  };

  return (
    <div className="search-section">
      <div className="search-input-area">
        <SearchInput 
          onSearchResult={handleSearchResult} 
          onReset={handleReset}
        />
        {/* ✨ 뉴스 박스 추가 */}
        <div className="news-box">
          <h3>항공 관련 최신 뉴스</h3>
          {news.length > 0 ? (
            <ul>
              {news.map((article, index) => (
                <li key={index}>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>뉴스 데이터를 불러오는 중...</p>
          )}
        </div>
      </div>
      <div className="search-results-and-rankings">
        <SearchResults 
          results={searchResults} 
          onRemoveItem={handleRemoveItem}
        />
        <Rankings />
      </div>
    </div>
  );
};

export default SearchSection;