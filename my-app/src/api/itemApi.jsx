import axiosInstance from '../utils/axios';

const itemApi = {
  searchItems: async (query) => {
    try {
      const response = await axiosInstance.get(`/api/items/search?name=${query}`);
      return response.data;
    } catch (error) {
      console.error('물품 검색 실패:', error);
      throw error;
    }
  },

  getSearchRankings: async () => {
    try {
      const response = await axiosInstance.get('/api/rankings/search');
      return response.data;
    } catch (error) {
      console.error('검색 랭킹 조회 실패:', error);
      throw error;
    }
  },

  getDetectionRankings: async () => {
    try {
      const response = await axiosInstance.get('/api/rankings/detection');
      return response.data;
    } catch (error) {
      console.error('적발 랭킹 조회 실패:', error);
      throw error;
    }
  },

  addDetection: async (detectionData) => {
    try {
      const response = await axiosInstance.post('/api/detection', detectionData);
      return response.data;
    } catch (error) {
      console.error('적발 정보 추가 실패:', error);
      throw error;
    }
  },

  getDetections: async () => {
    try {
      const response = await axiosInstance.get('/api/detection');
      return response.data;
    } catch (error) {
      console.error('적발 정보 조회 실패:', error);
      throw error;
    }
  }
};

export default itemApi; 