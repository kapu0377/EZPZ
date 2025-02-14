import axios from 'axios';

const INCHEON_API_KEY = "FUM7xFhbGE8Ui7ljC9EtXTAFE4zszroC5kr7fJRI/NZeKAHZmMV11gJJCgz25zXFuW9YMgjUnA6aeOabWDOipg==";
const BASE_URL = "http://apis.data.go.kr";

export const fetchICNParkingData = async () => {
  const param = {
    "serviceKey": decodeURIComponent(INCHEON_API_KEY),
    "numOfRows": 20,
    "pageNo": 1,
    "type": "json"
  }

  try {
    const response = await axios.get(`${BASE_URL}/B551177/StatusOfParking/getTrackingParking`, {params: param});
    const items = response.data.response.body.items;

    if (!items) {
      throw new Error('인천공항 주차장 데이터를 불러오는데 실패했습니다.');
    }

    // T1과 T2 데이터 분리
    const t1Items = items.filter(item => item.floor.includes('T1'));
    const t2Items = items.filter(item => item.floor.includes('T2'));

    // T1 데이터를 두 부분으로 나누기
    const halfLength = Math.ceil(t1Items.length / 2);
    const t1FirstHalf = t1Items.slice(0, halfLength);
    const t1SecondHalf = t1Items.slice(halfLength);

    // T1 첫 번째 슬라이드
    const formattedT1FirstData = {
      airportName: '인천국제공항 T1 (1/2)',
      parkingLots: t1FirstHalf.map(item => ({
        name: item.floor,
        totalSpots: parseInt(item.parkingarea) || 0,
        occupancyRate: calculateOccupancyRate(item.parkingarea, item.parking),
        status: calculateStatus(item.parkingarea, item.parking),
        availableSpots: calculateAvailableSpots(item.parkingarea, item.parking)
      }))
    };

    // T1 두 번째 슬라이드
    const formattedT1SecondData = {
      airportName: '인천국제공항 T1 (2/2)',
      parkingLots: t1SecondHalf.map(item => ({
        name: item.floor,
        totalSpots: parseInt(item.parkingarea) || 0,
        occupancyRate: calculateOccupancyRate(item.parkingarea, item.parking),
        status: calculateStatus(item.parkingarea, item.parking),
        availableSpots: calculateAvailableSpots(item.parkingarea, item.parking)
      }))
    };

    // T2 데이터
    const formattedT2Data = {
      airportName: '인천국제공항 T2',
      parkingLots: t2Items.map(item => ({
        name: item.floor,
        totalSpots: parseInt(item.parkingarea) || 0,
        occupancyRate: calculateOccupancyRate(item.parkingarea, item.parking),
        status: calculateStatus(item.parkingarea, item.parking),
        availableSpots: calculateAvailableSpots(item.parkingarea, item.parking)
      }))
    };

    // 세 개의 슬라이드 데이터를 배열로 반환
    return [formattedT1FirstData, formattedT1SecondData, formattedT2Data];

  } catch (error) {
    console.error('[ICNPreviewApi] 인천공항 주차장 데이터 조회 실패:', error);
    throw error;
  }
};

// 사용 가능한 주차 공간 계산
const calculateAvailableSpots = (total, occupied) => {
  const totalSpots = parseInt(total) || 0;
  const occupiedSpots = parseInt(occupied) || 0;
  return totalSpots - occupiedSpots;
};

// 점유율 계산
const calculateOccupancyRate = (total, occupied) => {
  const totalSpots = parseInt(total) || 0;
  const occupiedSpots = parseInt(occupied) || 0;
  
  if (totalSpots === 0) return 0;
  return Math.round((occupiedSpots / totalSpots) * 100);
};

// 혼잡도에 따른 상태 계산
const calculateStatus = (total, occupied) => {
  const occupancyRate = calculateOccupancyRate(total, occupied);
  
  if (occupancyRate >= 95) return '만차';
  if (occupancyRate >= 70) return '혼잡';
  return '여유';
};

export default {
  fetchICNParkingData
};