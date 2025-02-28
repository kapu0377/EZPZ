import React, { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import Rankings from "./Rankings";

const SearchSection = () => {
  const [searchResults, setSearchResults] = useState(() => {
    const savedResults = sessionStorage.getItem("searchResults");
    return savedResults ? JSON.parse(savedResults) : [];
  });

  const [flights, setFlights] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState("ALL"); // 선택한 공항
  const [currentIndex, setCurrentIndex] = useState(0); // 자동 슬라이드 인덱스

  useEffect(() => {
    sessionStorage.setItem("searchResults", JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        const response = await fetch(
          `https://api.odcloud.kr/api/FlightStatusListDTL/v1/getFlightStatusListDetail?page=1&perPage=10&returnType=JSON&serviceKey=${process.env.REACT_APP_FLIGHTSTATUSLIST_API_KEY}`
        );
        const data = await response.json();

        console.log("API 응답 데이터:", data);

        if (data.data && Array.isArray(data.data)) {
          setFlights(data.data);
        } else {
          setFlights([]);
        }
      } catch (error) {
        console.error("Error fetching flight data:", error);
      }
    };

    fetchFlightData();

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flights.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [flights.length]);

  const handleSearchResult = (result) => {
    setSearchResults((prev) => {
      if (prev.length >= 3) {
        return [...prev.slice(1), result];
      }
      return [...prev, result];
    });
  };

  const handleReset = () => {
    setSearchResults([]);
    sessionStorage.removeItem("searchResults");
  };

  const handleRemoveItem = (index) => {
    setSearchResults(prev => {
      const updatedResults = prev.filter((_, i) => i !== index);
      return updatedResults;
    });
  };

  // 공항 리스트 가져오기
  const airportList = [...new Set(flights.map((flight) => flight.AIRPORT))];

  return (
    <div className="search-section">
      <div className="search-input-area">
        <SearchInput onSearchResult={handleSearchResult} onReset={handleReset} />

        {/* 공항 선택 드롭다운 */}
        <select className="airport-select" onChange={(e) => setSelectedAirport(e.target.value)}>
          <option value="ALL">전체 공항</option>
          {airportList.map((airport) => (
            <option key={airport} value={airport}>
              {airport}
            </option>
          ))}
        </select>

        <div className="news-box">
          <h3>실시간 항공편</h3>
          {flights.length > 0 ? (
            <ul className="flight-list">
              {flights
                .filter((flight) =>
                  selectedAirport === "ALL" ? true : flight.AIRPORT === selectedAirport
                )
                .slice(currentIndex, currentIndex + 1) // 자동 슬라이드
                .map((flight, index) => (
                  <li key={index} className="flight-card">
                    <div className="flight-header">
                      <span className="flight-airline">{flight.AIRLINE_KOREAN}</span>
                      <span className="flight-number">{flight.AIR_FLN}</span>
                    </div>
                    <div className="flight-route">
                      <span className="flight-location">{flight.BOARDING_KOR}</span>
                      <span className="arrow">➡️</span>
                      <span className="flight-location">{flight.ARRIVED_KOR}</span>
                    </div>
                    <div className="flight-status">
                      <span className={`status-tag ${flight.RMK_KOR.includes("지연") ? "delayed" : "on-time"}`}>
                        {flight.RMK_KOR}
                      </span>
                    </div>
                    <div className="flight-time">
                      출발 예정: {flight.STD} | 실제 출발: {flight.ETD}
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p>항공편을 불러오는 중...</p>
          )}
        </div>
      </div>
      <div className="search-results-and-rankings">
        <SearchResults results={searchResults} onRemoveItem={handleRemoveItem} />
        <Rankings />
      </div>
    </div>
  );
};

export default SearchSection;
