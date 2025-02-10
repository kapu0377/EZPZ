import React, { useState } from 'react';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';

const SearchContainer = () => {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchResult = (result) => {
    setSearchResults([...searchResults, result]);
  };

  const handleReset = () => {
    setSearchResults([]);
  };

  return (
    <div className="search-container">
      <SearchInput onSearchResult={handleSearchResult} onReset={handleReset} />
      <SearchResults results={searchResults} />
    </div>
  );
};

export default SearchContainer;