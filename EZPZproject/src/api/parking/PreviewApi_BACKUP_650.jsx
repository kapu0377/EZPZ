import axios from 'axios';

const PARKING_API_KEY = "FUM7xFhbGE8Ui7ljC9EtXTAFE4zszroC5kr7fJRI/NZeKAHZmMV11gJJCgz25zXFuW9YMgjUnA6aeOabWDOipg==";

// 공항 코드와 상세 정보 매핑
export const AIRPORT_CODES = {
  GMP: { 
    code: 'GMP', 
    name: '김포국제공항',
    parkingLots: {
      'P1': '국내선 제1주차장',
      'P2': '국내선 제2주차장',
      'P3': '국제선 주차빌딩',
      'P4': '국제선 지하',
      'P5': '화물청사'
    }
  },
  PUS: { 
    code: 'PUS', 
    name: '김해국제공항',
    parkingLots: {
      'P1': 'P1 여객주차장',
      'P2': 'P2 여객주차장',
      'P3': 'P3 화물주차장'
    }
  },
  CJU: { 
    code: 'CJU', 
    name: '제주국제공항',
    parkingLots: {
      'P1': 'P1 주차장',
      'P2': 'P2 장기주차장',
      'P3': 'P3 화물주차장'
    }
  },
  TAE: { 
    code: 'TAE', 
    name: '대구국제공항',
    parkingLots: {
      'P1': '여객주차장',
      'P2': '화물'
    }
  },
  KWJ: { 
    code: 'KWJ', 
    name: '광주공항',
    parkingLots: {
      'P1': '여객주차장'
    }
  },
  RSU: { 
    code: 'RSU', 
    name: '여수공항',
    parkingLots: {
      'P1': '여객주차장'
    }
  },
  USN: { 
    code: 'USN', 
    name: '울산공항',
    parkingLots: {
      'P1': '여객주차장'
    }
  },
  KUV: { 
    code: 'KUV', 
    name: '군산공항',
    parkingLots: {
      'P1': '여객주차장'
    }
  },
  WJU: { 
    code: 'WJU', 
    name: '원주공항',
    parkingLots: {
      'P1': '여객주차장'
    }
  },
  CJJ: { 
    code: 'CJJ', 
    name: '청주국제공항',
    parkingLots: {
      'P1': '여객 제1주차장',
      'P2': '여객 제2주차장',
      'P3': '여객 제3주차장',
      'P4': '여객 제4주차장'
    }
  },

};

export const fetchPreviewParkingData = async () => {
  try {
    const airportCodes = Object.keys(AIRPORT_CODES);
    const parkingDataPromises = airportCodes.map(async (code) => {
      const param = {
        serviceKey: PARKING_API_KEY,
        pageNo: 1,
        numOfRows: 10,
        schAirportCode: code
      };

      try {
        const response = await axios.get(
          "/service/rest/AirportParkingCongestion/airportParkingCongestionRT",
          { params: param }
        );

        if (response.data?.response?.body?.items?.item) {
          const items = response.data.response.body.items.item;
          const itemsArray = Array.isArray(items) ? items : [items];

          return {
            airportCode: code,
            airportName: AIRPORT_CODES[code].name,
            parkingLots: itemsArray.map(item => ({
              name: getParkingLotName(code, item.parkingAirportCodeName),
              status: getStatusFromOccupancy(parseFloat(item.parkingCongestionDegree?.replace('%', '') || '0')),
              occupancyRate: parseFloat(item.parkingCongestionDegree?.replace('%', '') || '0'),
              totalSpots: parseInt(item.parkingTotalSpace || '0'),
              availableSpots: parseInt(item.parkingOccupiedSpace || '0')
            }))
          };
        }
        return null;
      } catch (error) {
        console.warn(`${code} 데이터 로딩 실패:`, error);
        return null;
      }
    });

    const results = await Promise.all(parkingDataPromises);
    return results.filter(result => result !== null);
  } catch (error) {
    console.error('주차장 데이터 로딩 실패:', error);
    throw error;
  }
};

const getParkingLotName = (airportCode, defaultName) => {
  const airport = AIRPORT_CODES[airportCode];
  if (!airport) return defaultName;
  
  // 주차장 코드에서 이름 매핑
  for (const [code, name] of Object.entries(airport.parkingLots)) {
    if (defaultName.includes(code)) return name;
  }
  return defaultName;
};

const getStatusFromOccupancy = (occupancy) => {
<<<<<<< HEAD
  if (occupancy >= 100) return '만차';
=======
  if (occupancy >= 95) return '만차';
>>>>>>> main
  if (occupancy >= 70) return '혼잡';
  return '여유';
};