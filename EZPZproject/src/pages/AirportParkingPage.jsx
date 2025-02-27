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
import AirportLocationModal from '../components/parking/AirportLocationModal';


const AirportParkingPage = () => {
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [incheonData, setIncheonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 추가된 상태: 모든 공항에서 모달 사용 가능
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isWJUModalOpen, setIsWJUModalOpen] = useState(false);
  const [isApModalOpen, setIsApModalOpen] = useState("");
  const [isApLocModalOpen, setIsApLocModalOpen] = useState(false);

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
      const etcData = setEtcData(data);
      setSelectedAirport(etcData);
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

  const setEtcData = (data) => {
    if(data.id === "GMP"){
      data = { ...data , ename:"gimpo", tel:"주차고객 지원실(주차안내) Tel. 02-2660-2515"}
    }else if(data.id === "PUS"){
      data = { ...data , ename:"gimhae", tel:"주차 대표번호 1661-2626, 051-974-3718"}
    }else if(data.id === "CJU"){
      data = { ...data , ename:"jeju", tel:"주차관리사무실 064-797-2701, 2702"}
    }else if(data.id === "TAE"){
      data = { ...data , ename:"daegu", tel:"주차장 이용안내소 Tel. 053-980-5254"}
    }else if(data.id === "CJJ"){
      data = { ...data , ename:"cheongju", tel:"주차장 이용안내 tel. 043-210-6755"}
    }else if(data.id === "KWJ"){
      data = { ...data , ename:"gwangju", tel:""}
    }else if(data.id === "RSU"){
      data = { ...data , ename:"yeosu", tel:""}
    }else if(data.id === "USN"){
      data = { ...data , ename:"ulsan", tel:""}
    }else if(data.id === "KUV"){
      data = { ...data , ename:"gunsan", tel:""}
    }else if(data.id === "WJU"){
      data = { ...data , ename:"wonju", tel:""}
    }
    return data;
  }
  const GenericFeeModal = ({ airportId, isOpen, onClose }) => {
    if (!isOpen) return null;
    const modalComponents = {
      GMP: <GMPFeeModal isOpen={isOpen} onClose={onClose} />,
      PUS: <PUSFeeModal isOpen={isOpen} onClose={onClose} />,
      CJU: <CJUFeeModal isOpen={isOpen} onClose={onClose} />,
      TAE: <TAEFeeModal isOpen={isOpen} onClose={onClose} />,
      CJJ: <CJJFeeModal isOpen={isOpen} onClose={onClose} />,
      KWJ: <KWJFeeModal isOpen={isOpen} onClose={onClose} />,
      RSU: <RSUFeeModal isOpen={isOpen} onClose={onClose} />,
      USN: <USNFeeModal isOpen={isOpen} onClose={onClose} />,
      KUV: <KUVFeeModal isOpen={isOpen} onClose={onClose} />,
      WJU: <WJUFeeModal isOpen={isOpen} onClose={onClose} />,
    };
  
    return modalComponents[airportId] || null;
  };
  return (

    <div className="airport-parking-container">
          <div className="description-section2">
          <h1>🚗 전국 공항 주차장 현황 🚗</h1>
                <p className="checklist-alert">
                    원활한 주차를 위한 각 공항별 실시간 주차장 현황도 입니다.
                </p>
            </div >
      
      
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
      {selectedAirport && selectedAirport?.id !== 'ICN' && (
        <div className="info-section">
          <div className="info-buttons">
            <button className="airport-button fee-info-button" onClick={() => setIsApModalOpen(selectedAirport.id)}>
            {selectedAirport.name} 주차요금
            </button>
            <button className="fee-info-button" onClick={() => setIsApLocModalOpen(true)}>
              오시는길
            </button>
            <a href={`https://www.airport.co.kr/${selectedAirport.ename}/index.do`} target="_blank" rel="noopener noreferrer"className="fee-info-button">
            {selectedAirport.name} 홈페이지
            </a>
          </div>
          <div className="contact-text-container">
            <p className="contact-info">{selectedAirport.tel}</p>
            <p className="contact-info">한국공항공사 고객센터 1661-2626 (06:00 ~ 23:00, 연중무휴)</p>
          </div>
        </div>
      )}
      <GenericFeeModal 
        airportId={isApModalOpen} 
        isOpen={!!isApModalOpen} 
        onClose={() => setIsApModalOpen("")} 
      />
      <AirportLocationModal
        airport={selectedAirport}
        isOpen={isApLocModalOpen}
        onClose={()=>setIsApLocModalOpen(false)}
      />

      {(selectedAirport || incheonData) && (
        <RatingSection 
          airport={selectedAirport || { id: 'ICN', name: '인천국제공항' }}
          isOpen={isWJUModalOpen} 
          onClose={() => setIsWJUModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default AirportParkingPage;