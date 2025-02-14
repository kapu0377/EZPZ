import { useState } from "react"
import itemApi from "../api/itemApi"
import "./SearchInput.css"

const SearchInput = ({ onSearchResult, onReset }) => {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showBatteryModal, setShowBatteryModal] = useState(false)
  const [batteryVoltage, setBatteryVoltage] = useState("")
  const [batteryCapacity, setBatteryCapacity] = useState("")

  const calculateWattHours = (voltage, mah) => {
    // mAh를 Ah로 변환 (1000mAh = 1Ah)
    const ah = mah / 1000;
    return voltage * ah;
  };

  const calculateBatteryStatus = (wh) => {
    const whValue = parseFloat(wh);
    if (whValue > 160) {
      return {
        isAllowed: false,
        message: "160Wh 이상의 배터리는 반입이 불가능합니다."
      };
    } else if (whValue > 100) {
      return {
        isAllowed: true,
        message: "승인 시 2개까지 반입이 가능합니다.",
        isConditional: true
      };
    } else {
      return {
        isAllowed: true,
        message: "5개까지 반입이 가능합니다.",
        isConditional: true
      };
    }
  };

  const handleBatteryCalculation = () => {
    const wattHours = calculateWattHours(parseFloat(batteryVoltage), parseFloat(batteryCapacity));
    const result = calculateBatteryStatus(wattHours);
    const newResult = {
      item: inputValue.trim(),
      status: result.isAllowed ? "반입가능" : "반입금지",
      details: `배터리 용량: ${wattHours.toFixed(2)}Wh - ${result.message}`,
      isConditional: result.isConditional || false
    };
    
    onSearchResult(newResult);
    setShowBatteryModal(false);
    setBatteryVoltage("");
    setBatteryCapacity("");
    setInputValue("");
  };

  const handleSearch = async () => {
    if (inputValue.trim()) {
      setIsLoading(true)
      try {
        const result = await itemApi.searchItems(inputValue.trim())
        let newResult;
        
        // 배터리 검색어 확인
        if (inputValue.trim().includes('배터리')) {
          setShowBatteryModal(true);
          setIsLoading(false);
          return;
        }
        
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
            details: result.restrictions || (result.isAllowed
              ? "기내 반입이 가능한 물품입니다."
              : "비행기 내부 및 수화물이 불가능합니다."),
            isConditional: result.isConditional
          };
        }
        
        onSearchResult(newResult);
        setInputValue("");
        
        const updatedRankings = await itemApi.getSearchRankings();
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

      {showBatteryModal && (
        <div className="modal-overlay">
          <div className="battery-modal">
            <h3>배터리 용량 계산</h3>
            <p>배터리 사양을 입력해주세요</p>
            <div className="battery-input-group">
              <div className="input-field">
                <label>전압 (V)</label>
                <input
                  type="number"
                  value={batteryVoltage}
                  onChange={(e) => setBatteryVoltage(e.target.value)}
                  placeholder="예: 3.7, 5, 7.4"
                />
              </div>
              <div className="input-field">
                <label>용량 (mAh)</label>
                <input
                  type="number"
                  value={batteryCapacity}
                  onChange={(e) => setBatteryCapacity(e.target.value)}
                  placeholder="예: 10000, 20000"
                />
              </div>
            </div>
            {batteryVoltage && batteryCapacity && (
              <p className="watt-hours-preview">
                계산된 와트시: {calculateWattHours(parseFloat(batteryVoltage), parseFloat(batteryCapacity)).toFixed(2)}Wh
              </p>
            )}
            <div className="modal-buttons">
              <button 
                onClick={handleBatteryCalculation}
                disabled={!batteryVoltage || !batteryCapacity}
              >
                확인
              </button>
              <button onClick={() => setShowBatteryModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchInput