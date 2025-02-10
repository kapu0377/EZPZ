import axios from 'axios';
import axiosInstance from '../utils/axios';

const authApi = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      const response = await axiosInstance.post('/api/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  },

  refresh: async (refreshToken) => {
    try {
      const response = await axios.create({
        baseURL: 'http://localhost:8080',
        headers: {
          'Content-Type': 'application/json',
        }
      }).post('/api/auth/refresh', { refreshToken });
      
      // 새로운 토큰들을 localStorage에 저장
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axiosInstance.post('/api/auth/logout', null, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }
};

export default authApi;

export const checkAuth = async () => {
  const response = await axiosInstance.get('/check');
  return response.data;
};

export const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};