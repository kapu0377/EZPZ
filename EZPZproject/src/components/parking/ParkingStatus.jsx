import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import axios from 'axios';

const ParkingStatus = () => {
  const [parkingData, setParkingData] = useState([]);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        // ICN 공항 데이터 가져오기
        const icnResponse = await axios.get('ICNParkingApi_URL');
        const icnData = icnResponse.data.map(item => ({
          airport: item.terminal,
          occupancy: calculateOccupancy(item.total, item.occupied),
          status: getStatusText(calculateOccupancy(item.total, item.occupied))
        }));

        // 다른 공항 데이터 가져오기
        const otherResponse = await axios.get('ParkingApi_URL');
        const otherData = otherResponse.data.map(item => ({
          airport: item.terminal,
          occupancy: calculateOccupancy(item.total, item.occupied),
          status: getStatusText(calculateOccupancy(item.total, item.occupied))
        }));

        setParkingData([...icnData, ...otherData]);
      } catch (error) {
        console.error('주차장 데이터 로딩 실패:', error);
      }
    };

    fetchParkingData();
    // 5분마다 데이터 갱신
    const interval = setInterval(fetchParkingData, 300000);
    return () => clearInterval(interval);
  }, []);

  const calculateOccupancy = (total, occupied) => {
    return Math.round((occupied / total) * 100);
  };

  const getStatusText = (occupancy) => {
    if (occupancy >= 100) return '만차';
    if (occupancy >= 70) return '혼잡';
    return '여유';
  };

  const getStatusColor = (occupancy) => {
    if (occupancy >= 100) return 'text-red-600 bg-red-100';
    if (occupancy >= 70) return 'text-yellow-500 bg-yellow-100';
    return 'text-green-500 bg-green-100';
  };

  return (
    <div className="parking-status p-4">
      <h3 className="text-lg font-bold mb-4">공항 별 주차현황</h3>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className="w-full"
      >
        {parkingData.map((parking, index) => (
          <SwiperSlide key={index}>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-bold text-xl mb-3">{parking.airport}</h4>
              <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getStatusColor(parking.occupancy)}`}
                  style={{ width: `${Math.min(parking.occupancy, 100)}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-lg">{parking.occupancy}%</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(parking.occupancy)}`}>
                  {parking.status}
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ParkingStatus;