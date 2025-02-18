import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8088',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
});

const itemApi = {
  searchItems: async (query) => {
    try {
      const username = localStorage.getItem('username');
      const response = await axiosInstance.get(`/api/items/search`, {
        params: {
          keyword: query,
          username: username
        }
      });
      return response.data;
    } catch (error) {
      console.error('물품 검색 실패:', error);
      throw error;
    }
  },

  getSearchRankings: async () => {
    try {
      const response = await axiosInstance.get('/api/search/top-categories');
      return response.data.map(item => ({
        name: item.category,
        count: item.searchCount
      }));
    } catch (error) {
      console.error('검색 랭킹 조회 실패:', error);
      return []; // 에러 시 빈 배열 반환
    }
  },

  getUserSearchHistory: async (username) => {
    try {
      const response = await axiosInstance.get(`/api/search/history`, {
        params: { username }
      });
      return response.data;
    } catch (error) {
      console.error('검색 기록 조회 실패:', error);
      throw error;
    }
  },

  getDailyRankings: async () => {
    try {
      const response = await axiosInstance.get('/api/search/daily-ranking');
      return response.data.map(item => ({
        name: item.category,
        count: item.searchCount
      }));
    } catch (error) {
      console.error('일간 랭킹 조회 실패:', error);
      return [];
    }
  },

  getWeeklyRankings: async () => {
    try {
      const response = await axiosInstance.get('/api/search/weekly-ranking');
      return response.data.map(item => ({
        name: item.category,
        count: item.searchCount
      }));
    } catch (error) {
      console.error('주간 랭킹 조회 실패:', error);
      return [];
    }
  },

  getMonthlyRankings: async () => {
    try {
      const response = await axiosInstance.get('/api/search/monthly-ranking');
      return response.data.map(item => ({
        name: item.category,
        count: item.searchCount
      }));
    } catch (error) {
      console.error('월간 랭킹 조회 실패:', error);
      return [];
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
