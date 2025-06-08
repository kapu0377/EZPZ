import axiosInstance from '../utils/axios';
import { getUsernameFromRefreshToken } from '../utils/authUtils';
import { getSecureItem } from '../utils/cryptoUtils';

const authApi = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      console.log('회원가입 요청 데이터:', userData);
      const response = await axiosInstance.post('/auth/signup', userData);
      console.log('회원가입 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('로그아웃 요청 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  },

  reissue: async () => {
    try {
      console.log('토큰 재발급 요청 중...');
      
      const refreshToken = getSecureItem('refreshToken');
      
      if (!refreshToken) {
        console.log('저장된 리프레시 토큰이 없음');
        throw new Error('RefreshToken이 없습니다.');
      }
      
      const username = getUsernameFromRefreshToken() || "";
      console.log('RefreshToken에서 추출한 username:', username);
      
      const requestBody = { 
        refreshToken,
        username
      };
      console.log('저장된 리프레시 토큰으로 재발급 요청');
      
      const response = await fetch('/api/auth/reissue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('토큰 재발급 HTTP 에러:', response.status, errorData);
        throw new Error(`토큰 재발급 실패: ${response.status} ${errorData}`);
      }

      const data = await response.json();
      console.log('토큰 재발급 성공');
      return data;
    } catch (error) {
      console.error('토큰 재발급 실패:', error);
      throw error;
    }
  },

  updateUser: async (userData) => {
    try {
      const response = await axiosInstance.put('/auth/update', userData);
      return response.data;
    } catch (error) {
      console.error("회원 정보 수정 실패:", error);
      throw error;
    }
  },

  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/user/info');
      return response.data;
    } catch (error) {
      console.error("사용자 정보 불러오기 실패:", error);
      throw error;
    }
  },

  deleteUser: async (password) => {
    try {
      const response = await axiosInstance.delete('/auth/delete', {
        data: { password },
      });
      return response.data;
    } catch (error) {
      console.error("회원 탈퇴 실패:", error.response?.data || error);
      throw error;
    }
  },

  verifyPassword: async (password) => {
    try {
      const response = await axiosInstance.post('/auth/verify-password', { password });
      return response.data;
    } catch (error) {
      console.error("비밀번호 검증 실패:", error.response?.data || error);
      return { valid: false }; 
    }
  },

};

export default authApi;

export const checkAuth = async () => {
  const response = await axiosInstance.get('/check');
  return response.data;
};

export const authHeader = () => {
  return {};
};

