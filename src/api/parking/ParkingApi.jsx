import axios from 'axios';

const PARKING_API_KEY = import.meta.env.VITE_AIRPORTAPI_KEY;

// 공항 코드 상수 정의
export const AIRPORT_CODES = {
  GMP: { code: 'GMP', name: '김포국제공항' },
  PUS: { code: 'PUS', name: '김해국제공항' },
  CJU: { code: 'CJU', name: '제주국제공항' },
  TAE: { code: 'TAE', name: '대구국제공항' },
  CJJ: { code: 'CJJ', name: '청주국제공항' },
  KWJ: { code: 'KWJ', name: '광주공항' },
  RSU: { code: 'RSU', name: '여수공항' },
  USN: { code: 'USN', name: '울산공항' },
  KUV: { code: 'KUV', name: '군산공항' },
  WJU: { code: 'WJU', name: '원주공항' }
};

export const fetchAirportParkingData = async (airportCode) => {
  const param = {
    "serviceKey": PARKING_API_KEY,
    "pageNo": 1,
    "numOfRows": 10,
    "schAirportCode": airportCode,
  }

  try {
    const response = await axios.get("/service/rest/AirportParkingCongestion/airportParkingCongestionRT", {params:param});
    const items = response.data.response.body.items.item;
    
    // 단일 항목인 경우 배열로 변환
    const itemsArray = Array.isArray(items) ? items : [items];
    
    return {
      id: airportCode,
      name: AIRPORT_CODES[airportCode].name,
      terminals: itemsArray.map(item => ({
        terminal: item.parkingAirportCodeName,
        occupancy: parseFloat(item.parkingCongestionDegree.replace('%', '')),
        totalSpots: parseInt(item.parkingTotalSpace),
        availableSpots: parseInt(item.parkingTotalSpace) - parseInt(item.parkingOccupiedSpace),
      }))
    };
  } catch (error) {
    console.error(`${airportCode} 데이터 불러오기 실패:`, error);
    throw error;
  }
};