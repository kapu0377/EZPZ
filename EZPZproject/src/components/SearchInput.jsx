import { useState } from "react"
import itemApi from "../api/itemApi"

const SearchInput = ({ onSearchResult, onReset }) => {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (inputValue.trim()) {
      setIsLoading(true)
      try {
        const result = await itemApi.searchItems(inputValue.trim())
        let newResult;
        
        if (!result || 
            result.error === "NOT_FOUND" || 
            result.originalText === "해당 물품은 기본적으로 기내 반입이 가능합니다.") {
          newResult = {
            item: inputValue.trim(),
            status: "반입가능",
            details: "해당 물품은 기본적으로 기내 반입이 가능합니다.",
            isConditional: false
          };
        } else {
          newResult = {
            item: inputValue.trim(),
            status: result.isAllowed ? "반입가능" : "반입금지",
            details: result.isAllowed
              ? "기내 반입이 가능한 물품입니다."
              : result.isConditional
              ? "수화물만 부분 허용되었습니다."
              : "비행기 내부 및 수화물이 불가능합니다.",
            isConditional: result.isConditional
          };
        }
        
        onSearchResult(newResult);
        setInputValue("");
        
        // 검색 후 랭킹 즉시 업데이트
        const updatedRankings = await itemApi.getSearchRankings();
        // Rankings 컴포넌트에 업데이트된 데이터를 전달하기 위한 이벤트 발생
        window.dispatchEvent(new CustomEvent('rankingsUpdated', { 
          detail: updatedRankings 
        }));
        
      } catch (error) {
        console.error("검색 오류:", error);
        alert("물품 검색 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="search-input">
      <div className="search-input-header">
        <span>기내반입가능여부조회</span>
        <button onClick={onReset}>초기화</button>
      </div>
      <div className="search-input-field">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="물품명을 입력하세요"
          disabled={isLoading}
        />
        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "검색 중..." : "검색"}
        </button>
      </div>
    </div>
  )
}

export default SearchInput