import axios from 'axios';

const INCHEON_API_KEY = import.meta.env.VITE_INCHEON_API_KEY;
const BASE_URL = "https://apis.data.go.kr";

export const fetchIncheonParkingData = async () => {
  const param = {
    "serviceKey": INCHEON_API_KEY,
    "numOfRows": 20,
    "pageNo": 1,
    "type": "json"
  }

  try {
    const response = await axios.get(`${BASE_URL}/B551177/StatusOfParking/getTrackingParking`, {params: param});

    const items = response.data.response.body.items;
    
    const groupedData = items.reduce((acc, item) => {
      const isT1 = item.floor.includes('T1');
      const terminalKey = isT1 ? 'T1' : 'T2';
      
      if (!acc[terminalKey]) {
        acc[terminalKey] = {
          id: terminalKey,
          name: isT1 ? '제1터미널' : '제2터미널',
          terminals: []
        };
      }

      // 주차장 사용률 계산
      const total = parseInt(item.parkingarea);
      const used = parseInt(item.parking);
      const occupancyRate = Math.round((used / total) * 100);

      acc[terminalKey].terminals.push({
        terminal: item.floor,
        occupancy: occupancyRate,
        totalSpots: total,
        availableSpots: total - used,
        usedSpots: used,
        datetm: item.datetm
      });

      return acc;
    }, {});

    // 터미널별로 정렬된 데이터 반환
    return Object.values(groupedData).map(terminal => ({
      ...terminal,
      terminals: terminal.terminals.sort((a, b) => 
        a.terminal.localeCompare(b.terminal)
      )
    }));

  } catch (error) {
    console.error('인천공항 주차장 데이터 불러오기 실패:', error);
    throw error;
  }
};