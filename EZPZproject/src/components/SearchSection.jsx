import React, { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import Rankings from "./Rankings";

const SearchSection = () => {
  const [searchResults, setSearchResults] = useState(() => {
    const savedResults = sessionStorage.getItem('searchResults');
    return savedResults ? JSON.parse(savedResults) : [];
  });

  useEffect(() => {
    sessionStorage.setItem('searchResults', JSON.stringify(searchResults));
  }, [searchResults]);

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