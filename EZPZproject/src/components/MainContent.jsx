import { useState } from 'react';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import Rankings from './Rankings';

const MainContent = () => {
  const [searchResults, setSearchResults] = useState(() => {
    const savedResults = sessionStorage.getItem('searchResults');
    return savedResults ? JSON.parse(savedResults) : [];
  });
  
  const handleSearchResult = (newResult) => {
    setSearchResults(prevResults => {
      const updatedResults = prevResults.length >= 3
        ? [...prevResults.slice(1), newResult]
        : [...prevResults, newResult];
      sessionStorage.setItem('searchResults', JSON.stringify(updatedResults));
      return updatedResults;
    });
  };

  const handleRemoveItem = (index) => {
    setSearchResults(prevResults => {
      const updatedResults = prevResults.filter((_, i) => i !== index);
      sessionStorage.setItem('searchResults', JSON.stringify(updatedResults));
      return updatedResults;
    });
  };

  const handleReset = () => {
    setSearchResults([]);
    sessionStorage.removeItem('searchResults');
  };

  return (
    <div className="main-content">
      <div className="search-section">
        <SearchInput 
          onSearchResult={handleSearchResult}
          onReset={handleReset}
        />
        <SearchResults 
          results={searchResults}
          onRemoveItem={handleRemoveItem}
        />
      </div>
      <Rankings />
    </div>
  );
};

export default MainContent;