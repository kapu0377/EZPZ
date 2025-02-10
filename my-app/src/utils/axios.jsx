import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axios.create({
          baseURL: 'http://localhost:8080',
          headers: { 'Content-Type': 'application/json' }
        }).post('/api/auth/refresh', { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;
        if (!accessToken) {
          throw new Error('No access token received');
        }
        
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearStorageAndRedirect();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

function clearAuthData() {
  // 인증 관련 데이터만 제거
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('mid');
  localStorage.removeItem('username');
  localStorage.removeItem('name');
  sessionStorage.removeItem('searchResults');
}

function clearStorageAndRedirect() {
  clearAuthData();
  window.location.href = '/login';
}

export default axiosInstance;