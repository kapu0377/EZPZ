import { useState } from "react"
import itemApi from "../api/itemApi"
import { saveSearchHistory } from "../api/searchApi"
import "./SearchInput.css"

const SearchInput = ({ onSearchResult }) => {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showBatteryModal, setShowBatteryModal] = useState(false)
  const [batteryVoltage, setBatteryVoltage] = useState("")
  const [batteryCapacity, setBatteryCapacity] = useState("")

  const calculateWattHours = (voltage, mah) => {
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
    
    const username = localStorage.getItem('username');
    if (username) {
      saveSearchHistory(username, inputValue.trim());
      window.dispatchEvent(new CustomEvent('search-history-updated'));
    }
    
    setShowBatteryModal(false);
    setBatteryVoltage("");
    setBatteryCapacity("");
    setInputValue("");
  };

  const handleSearch = async () => {
    if (inputValue.trim()) {
      setIsLoading(true);
      try {
        const result = await itemApi.searchItems(inputValue.trim());
        let newResult;
        
        if (inputValue.trim().toLowerCase().includes('배터리')) {
          setShowBatteryModal(true);
          setIsLoading(false);
          return;
        }
        
        if (result && !result.error && result.restrictions) {
          let status;
          let details = result.restrictions;
          
          console.log("검색 결과 디버깅:", {
            item: inputValue.trim(),
            isAllowed: result.isAllowed,
            isConditional: result.isConditional,
            restrictions: result.restrictions
          });
          
          const actualAllowed = (result.isAllowed === undefined && 
                                 details.toLowerCase().includes('반입 가능')) ? 
                                 true : result.isAllowed;
          
          const actualConditional = result.isConditional;
          const hasDbValue = result.isAllowed !== undefined;
          const indicatesProhibited = details.toLowerCase().includes('반입 불가') || 
          details.toLowerCase().includes('반입불가') ||
          details.toLowerCase().includes('모두 불가');

          const isCheckedBaggageOnly = details.toLowerCase().includes('수하물만') || 
          details.toLowerCase().includes('위탁수하물만');
          
          console.log("상태 판단 조건:", {
            actualAllowed,
            actualConditional,
            indicatesProhibited,
            isCheckedBaggageOnly,
            detailsLower: details.toLowerCase()
          });
        
          if (!actualAllowed) {
            console.log("DB에서 반입불가로 설정됨");
          }
          
          if (indicatesProhibited) {
            console.log("텍스트에서 반입불가 표현 발견:", 
              details.toLowerCase().includes('반입 불가') ? '반입 불가' : 
              details.toLowerCase().includes('반입불가') ? '반입불가' : 
              '모두 불가'
            );
          }
        
          if (hasDbValue) {
            if (actualConditional || isCheckedBaggageOnly) {
              status = "부분허용";
            } else if (!actualAllowed) {
              status = "반입금지";
            } else {
              status = "반입가능";
            }
          } else {
            if (indicatesProhibited) {
              status = "반입금지";
            } else if (isCheckedBaggageOnly) {
              status = "부분허용";
            } else {
              status = "반입가능";
            }
          }
          
          console.log("최종 결정된 상태:", status);
        
          newResult = {
            item: inputValue.trim(),
            status: status,
            details: details,
            isConditional: actualConditional || isCheckedBaggageOnly
          };
        } else {
          const potentialDangerousKeywords = [
            '페인트볼', '마커', '총', '무기', '칼', '가위', '화약', '폭발', '배터리',
            '에어로졸', '스프레이', '가스', '인화성', '액체', '독극물', '라이터','마약'
          ];
          
          const containsDangerousKeyword = potentialDangerousKeywords.some(
            keyword => inputValue.trim().toLowerCase().includes(keyword.toLowerCase())
          );
          
          console.log("DB에 없는 항목:", {
            item: inputValue.trim(),
            containsDangerousKeyword,
            matchedKeywords: potentialDangerousKeywords.filter(keyword => 
              inputValue.trim().toLowerCase().includes(keyword.toLowerCase())
            )
          });
          
          if (containsDangerousKeyword) {
            newResult = {
              item: inputValue.trim(),
              status: "확인필요",
              details: "데이터베이스에 정확한 정보가 없습니다. 보안검색대에서 확인이 필요할 수 있습니다.",
              isConditional: true
            };
          } else {
            newResult = {
              item: inputValue.trim(),
              status: "반입가능",
              details: "기내 반입 가능, 특별 제한 없음",
              isConditional: false
            };
          }
        }
        
        onSearchResult(newResult);
        setInputValue("");
        
        const username = localStorage.getItem('username');
        if (username) {
          await saveSearchHistory(username, inputValue.trim());
          window.dispatchEvent(new CustomEvent('search-history-updated'));
        }
        
        try {
          const updatedRankings = await itemApi.getSearchRankings();
          if (updatedRankings && updatedRankings.length > 0) {
            window.dispatchEvent(new CustomEvent('rankingsUpdated', { 
              detail: updatedRankings 
            }));
          }
        } catch (error) {
          console.error("랭킹 업데이트 실패:", error);
        }
        
      } catch (error) {
        console.error("검색 오류:", error);
        alert("물품 검색 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <div className="search-input">
      <div className="search-input-header">
        <span>기내반입가능여부조회</span>
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
                  placeholder="예: 3.8, 5, 7.4"
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