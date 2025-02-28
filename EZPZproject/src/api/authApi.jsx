import axiosInstance from '../utils/axios';

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
      const accessToken = localStorage.getItem('accessToken');
      const response = await axiosInstance.post('/auth/logout', {
        accessToken: accessToken
      });

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('name');

      return response.data;
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  },

  reissue: async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const username = localStorage.getItem('username');
      const response = await axiosInstance.post('/auth/reissue', {
        accessToken: accessToken,
        username: username
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      return response.data;
    } catch (error) {
      console.error('토큰 재발급 실패:', error);
      throw error;
    }
  },

  updateUser: async (userData) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.put('/auth/update', userData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("회원 정보 수정 실패:", error);
      throw error;
    }
  },

  getUserProfile: async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("사용자 정보 불러오기 실패:", error);
      throw error;
    }
  },

  deleteUser: async (password) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.delete('/auth/delete', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
      const accessToken = localStorage.getItem('accessToken');
      const response = await axiosInstance.post('/auth/verify-password', 
        { password },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        }
      );
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
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const expiredAccessToken = localStorage.getItem('accessToken');
      
      const refreshToken = localStorage.getItem('refreshToken');

      if (!expiredAccessToken || !refreshToken) {
        console.error('Access token or refresh token not found.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        localStorage.removeItem('name');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axiosInstance.post('/auth/reissue', { 
          accessToken: expiredAccessToken
        });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) { 
            localStorage.setItem('refreshToken', newRefreshToken); 
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } else {
           throw new Error('Failed to receive new access token');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        localStorage.removeItem('name');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);