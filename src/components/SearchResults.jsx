import React from 'react';

const SearchResults = ({ results, onRemoveItem }) => {
  if (!results || results.length === 0) {
    return (
      <div className="search-results">
        <h3>반입가능여부 결과</h3>
        <p className="no-results">검색 결과가 없습니다.</p>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "반입금지":
        return "prohibited";
      case "부분허용":
        return "conditional";
      case "반입가능":
        return "allowed";
      default:
        return "allowed";
    }
  };

  const handleDoubleClick = (index) => {
    if (window.confirm('이 항목을 삭제하시겠습니까?')) {
      onRemoveItem(index);
    }
  };

  return (
    <div className="search-results">
      <h2>반입가능여부 결과</h2>
      <div className="results-list">
        {results.map((result, index) => (
          <div 
            key={index} 
            className="result-item"
            onDoubleClick={() => handleDoubleClick(index)}
            style={{ cursor: 'pointer' }}
            title="더블클릭하여 삭제"
          >
            <div className="item-header">
              <span className="item-name">{result.item}</span>
              <span className={`item-status ${getStatusClass(result.status)}`}>
                {result.status}
              </span>
            </div>
            <div className="item-details">
              {result.details}
              {result.isConditional && result.details !== "기내 반입 가능, 특별 제한 없음" && (
                <div className="conditional-notice">
                  * 조건부 반입 가능 물품입니다. 자세한 내용은 상세정보를 확인해주세요.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;