import React, { useState } from 'react';
import AirportCard from '../components/parking/AirportCard';
import '../components/parking/AirportParking.css';
import axios from 'axios';
import { fetchAirportParkingData, AIRPORT_CODES } from '../api/parking/ParkingApi';
import { fetchIncheonParkingData } from '../api/parking/ICNParkingApi';
import ICNFeeModal from '../components/parking/Modal/ICNFeeModal';
import ICNContactModal from '../components/parking/Modal/ICNContactModal';
import GMPFeeModal from '../components/parking/Modal/GPMFeeModal';
import PUSFeeModal from '../components/parking/Modal/PUSFeeModal';
import CJUFeeModal from '../components/parking/Modal/CJUFeeModal';
import TAEFeeModal from '../components/parking/Modal/TAEFeeModal';
import KWJFeeModal from '../components/parking/Modal/KWJFeeModal';
import RSUFeeModal from '../components/parking/Modal/RSUFeeModal';
import USNFeeModal from '../components/parking/Modal/USNFeeModal';
import KUVFeeModal from '../components/parking/Modal/KUVFeeModal';
import WJUFeeModal from '../components/parking/Modal/WJUFeeModal';
import CJJFeeModal from '../components/parking/Modal/CJJFeeModal';
import RatingSection from '../components/rating/RatingSection';


const AirportParkingPage = () => {
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [incheonData, setIncheonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isGmpModalOpen, setIsGmpModalOpen] = useState(false);
  const [isPusModalOpen, setIsPusModalOpen] = useState(false);
  const [isCJUModalOpen, setIsCJUModalOpen] = useState(false);
  const [isTAEModalOpen, setIsTAEModalOpen] = useState(false);
  const [isCJJModalOpen, setIsCJJModalOpen] = useState(false);
  const [isKWJModalOpen, setIsKWJModalOpen] = useState(false);
  const [isRSUModalOpen, setIsRSUModalOpen] = useState(false);
  const [isUSNModalOpen, setIsUSNModalOpen] = useState(false);
  const [isKUVModalOpen, setIsKUVModalOpen] = useState(false);
  const [isWJUModalOpen, setIsWJUModalOpen] = useState(false);

  const [ratings, setRatings] = useState({
    satisfaction: 5,
    cleanliness: 5,
    convenience: 5,
    comment: ''
  });
  const [averageRatings, setAverageRatings] = useState(null);

  

  const loadAirportData = async (airportCode) => {
    // 이미 선택된 공항을 다시 클릭한 경우 데이터를 숨김
    if (selectedAirport?.id === airportCode) {
      setSelectedAirport(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAirportParkingData(airportCode);
      setSelectedAirport(data);
      setIncheonData(null); // 인천공항 데이터 초기화
    } catch (err) {
      setError(`${AIRPORT_CODES[airportCode].name} 데이터를 불러오는데 실패했습니다.`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIncheonData = async () => {
    // 인천공항 데이터가 이미 있으면 숨김
    if (incheonData) {
      setIncheonData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchIncheonParkingData();
      setIncheonData(data);
      setSelectedAirport(null); // 다른 공항 데이터 초기화
    } catch (err) {
      setError('인천공항 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCongestionColor = (occupancy) => {
    if (occupancy >= 80) return '#ff4d4d';
    if (occupancy >= 50) return '#ffd700';
    return '#4CAF50';
  };

  const fetchAverageRatings = async (airportId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/airports/${airportId}/ratings/average`);
      setAverageRatings(response.data);
    } catch (error) {
      console.error('평균 평점 조회 실패:', error);
    }
  };

  const handleRatingSubmit = async (airportId) => {
    try {
      await axios.post(`http://localhost:8080/api/airports/${airportId}/ratings`, ratings);
      alert('평가가 성공적으로 제출되었습니다!');
      fetchAverageRatings(airportId);
      setRatings({
        satisfaction: 5,
        cleanliness: 5,
        convenience: 5,
        comment: ''
      });
    } catch (error) {
      alert('평가 제출에 실패했습니다.');
    }
  };

  return (
    <div className="airport-parking-container" style={{ minHeight: 'calc(100vh - 400px)' }}>
      <h1>전국 공항 주차장 현황</h1>
      
      <div className="airport-buttons">
        <button
          onClick={loadIncheonData}
          className={`airport-button ${incheonData ? 'active' : ''}`}
        >
          인천국제공항
        </button>
        {Object.values(AIRPORT_CODES).map(airport => (
          <button
            key={airport.code}
            onClick={() => loadAirportData(airport.code)}
            className={`airport-button ${selectedAirport?.id === airport.code ? 'active' : ''}`}
          >
            {airport.name}
          </button>
        ))}
      </div>

      {isLoading && <div className="loading">데이터를 불러오는 중입니다...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="airports-grid">
        {selectedAirport && (
          <AirportCard
            airport={selectedAirport}
            getCongestionColor={getCongestionColor}
          />
        )}
        {incheonData && incheonData.map(terminal => (
          <AirportCard
            key={terminal.id}
            airport={terminal}
            getCongestionColor={getCongestionColor}
          />
        ))}
      </div>

      {incheonData && (
        <div className="info-section">
          <div className="contact-text-container">
            <p className="contact-info">-(마이너스)로 표시된 주차공간은 이중주차로 인한 현상입니다.</p>
          </div>
          <div className="info-buttons">
            <button className="airport-button fee-info-button" onClick={() => setIsModalOpen(true)}>
              인천공항 주차요금
            </button>
            <a href="https://www.airport.kr/ap_ko/970/subview.do" target="_blank" rel="noopener noreferrer" className="airport-button fee-info-button">
            전기차 충전소</a>
            <a href="https://www.airport.kr/ap_ko/6600/subview.do" target="_blank" rel="noopener noreferrer" className="airport-button fee-info-button">
            공항-주차장 셔틀버스</a>
            <button className="airport-button fee-info-button" onClick={() => setIsContactModalOpen(true)}>
            긴급전화 번호
            </button>
            <a href="https://www.airport.kr/sites/ap_ko/index.do" target="_blank" rel="noopener noreferrer" className="airport-button fee-info-button">
            인천공항 홈페이지</a>
          </div>
        </div>
      )}

      <ICNFeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <ICNContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />

      {selectedAirport?.id === 'GMP' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="airport-button fee-info-button" onClick={() => setIsGmpModalOpen(true)}>
            김포공항 주차요금
            </button>
            <a href="https://www.airport.co.kr/gimpo/index.do" target="_blank" rel="noopener noreferrer"className="fee-info-button">
            김포공항 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">주차고객 지원실(주차안내) Tel. 02-2660-2515</p>
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <GMPFeeModal 
        isOpen={isGmpModalOpen} 
        onClose={() => setIsGmpModalOpen(false)} 
      />

      {selectedAirport?.id === 'PUS' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="fee-info-button" onClick={() => setIsPusModalOpen(true)}>
            김해공항 주차요금
            </button>
            <a href="https://www.airport.co.kr/gimhae/index.do" target="_blank" rel="noopener noreferrer" className="fee-info-button">
            김해공항 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">주차 대표번호 1661-2626, 051-974-3718</p>
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <PUSFeeModal 
        isOpen={isPusModalOpen} 
        onClose={() => setIsPusModalOpen(false)} 
      />

      {selectedAirport?.id === 'CJU' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="fee-info-button" onClick={() => setIsCJUModalOpen(true)}>
            제주공항 주차요금
            </button>
            <a href="https://www.airport.co.kr/jeju/index.do" target="_blank" rel="noopener noreferrer" className="fee-info-button">
            제주공항 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">주차관리사무실 064-797-2701, 2702</p>
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <CJUFeeModal
        isOpen={isCJUModalOpen} 
        onClose={() => setIsCJUModalOpen(false)} 
      />

      {selectedAirport?.id === 'TAE' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="fee-info-button" onClick={() => setIsTAEModalOpen(true)}>
            대구공항 주차요금
            </button>
            <a href="https://www.airport.co.kr/daegu/index.do" target="_blank" rel="noopener noreferrer" className="fee-info-button">
            대구공항 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">주차장 이용안내소 Tel. 053-980-5254</p>
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <TAEFeeModal
        isOpen={isTAEModalOpen} 
        onClose={() => setIsTAEModalOpen(false)} 
      />

      {selectedAirport?.id === 'CJJ' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="fee-info-button" onClick={() => setIsCJJModalOpen(true)}>
            청주공항 주차요금
            </button>
            <a href="https://www.airport.co.kr/cheongju/index.do" target="_blank" rel="noopener noreferrer" className="fee-info-button">
            청주공항 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">주차장 이용안내 tel. 043-210-6755</p>
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <CJJFeeModal
        isOpen={isCJJModalOpen} 
        onClose={() => setIsCJJModalOpen(false)} 
      />

      {selectedAirport?.id === 'KWJ' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="fee-info-button" onClick={() => setIsKWJModalOpen(true)}>
            광주공항 주차요금
            </button>
            <a href="https://www.airport.co.kr/gwangju/index.do" target="_blank" rel="noopener noreferrer" className="fee-info-button">
            광주공항 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <KWJFeeModal
        isOpen={isKWJModalOpen} 
        onClose={() => setIsKWJModalOpen(false)} 
      />

      {selectedAirport?.id === 'RSU' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="fee-info-button" onClick={() => setIsRSUModalOpen(true)}>
            여수공항 주차요금
            </button>
            <a href="https://www.airport.co.kr/yeosu/index.do" target="_blank" rel="noopener noreferrer" className="fee-info-button">
            여수공항 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <RSUFeeModal
        isOpen={isRSUModalOpen} 
        onClose={() => setIsRSUModalOpen(false)} 
      />

      {selectedAirport?.id === 'USN' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="fee-info-button" onClick={() => setIsUSNModalOpen(true)}>
            울산공항 주차요금
            </button>
            <a href="https://www.airport.co.kr/ulsan/index.do" target="_blank" rel="noopener noreferrer" className="fee-info-button">
            울산공항 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <USNFeeModal
        isOpen={isUSNModalOpen} 
        onClose={() => setIsUSNModalOpen(false)} 
      />

      {selectedAirport?.id === 'KUV' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="fee-info-button" onClick={() => setIsKUVModalOpen(true)}>
            군산공항 주차요금
            </button>
            <a href="https://www.airport.co.kr/gunsan/index.do" target="_blank" rel="noopener noreferrer" className="fee-info-button">
            군산공항 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <KUVFeeModal
        isOpen={isKUVModalOpen} 
        onClose={() => setIsKUVModalOpen(false)} 
      />

      {selectedAirport?.id === 'WJU' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="fee-info-button" onClick={() => setIsWJUModalOpen(true)}>
            원주공항 주차요금
            </button>
            <a href="https://www.airport.co.kr/wonju/index.do" target="_blank" rel="noopener noreferrer" className="fee-info-button">
            원주공항 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <WJUFeeModal
        isOpen={isWJUModalOpen} 
        onClose={() => setIsWJUModalOpen(false)} 
      />

      {(selectedAirport || incheonData) && (
        <RatingSection 
          airport={selectedAirport || { id: 'ICN', name: '인천국제공항' }}
        />
      )}
    </div>
  );
};

export default AirportParkingPage;