import axios from 'axios';
import { clearAllAuthData, getUsernameFromRefreshToken, refreshAccessToken } from './authUtils';
import { getSecureItem, setSecureItem } from './cryptoUtils';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

let tokenRefreshCallbacks = [];
let isRefreshing = false;
let refreshPromise = null;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;



export const registerTokenRefreshCallback = (callback) => {
  tokenRefreshCallbacks.push(callback);

};

export const unregisterTokenRefreshCallback = (callback) => {
  tokenRefreshCallbacks = tokenRefreshCallbacks.filter(cb => cb !== callback);

};

export const getTokenRefreshStatus = () => ({
  isRefreshing,
  refreshAttempts
});

export const resetTokenRefreshStatus = () => {
  isRefreshing = false;
  refreshPromise = null;
  refreshAttempts = 0;

};

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      alert('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      return Promise.reject(error);
    }

    if (!error.response) {
      console.error('Network error:', error);
      alert('네트워크 연결을 확인해주세요.');
      return Promise.reject(error);
    }

    const { status } = error.response;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/reissue') || 
                          originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/logout');
    

    
    if ((status === 401 || status === 403) && !originalRequest._retry && !isAuthEndpoint) {

      
      if (isRefreshing && refreshPromise) {
        try {
          await refreshPromise;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error('토큰 재발급 대기 중 실패:', refreshError);
          return Promise.reject(refreshError);
        }
      }

      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.error('토큰 재발급 최대 시도 횟수 초과');
        handleAuthFailure('토큰 재발급 최대 시도 횟수를 초과했습니다.');
        return Promise.reject(new Error('Max refresh attempts exceeded'));
      }
      
      originalRequest._retry = true;
      refreshAttempts++;
      isRefreshing = true;
      

      
      const refreshToken = getSecureItem('refreshToken');
      
      if (!refreshToken) {
        handleAuthFailure('로그인이 필요합니다.');
        return Promise.reject(new Error('No refresh token available'));
      }
      
      refreshPromise = refreshAccessToken();

      try {
        await refreshPromise;
        refreshAttempts = 0;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError);
        handleAuthFailure('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        return Promise.reject(refreshError);
      }
    }

    if (status === 404) {
      console.error('Resource not found:', error);
      return Promise.reject(error);
    }

    if (status >= 500) {
      console.error('Server error:', error);
      alert('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return Promise.reject(error);
    }

    if (status >= 400 && status < 500) {
      console.error('Client error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || '요청을 처리할 수 없습니다.';
      if (typeof errorMessage === 'string') {
        console.warn('API Error:', errorMessage);
      }
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

const performTokenRefresh = async (refreshToken) => {

  
  const username = getUsernameFromRefreshToken() || "";
  
  try {
    const requestBody = { 
      refreshToken,
      username
    };
    
 
    
    const response = await fetch('/api/auth/reissue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });
    

    
    if (response.ok) {
      try {
        const data = await response.json();
        
        // 리프레시 토큰이 새로 발급된 경우에만 업데이트
        if (data.refreshToken && data.refreshToken !== refreshToken) {
          setSecureItem('refreshToken', data.refreshToken);
          console.log('새로운 리프레시 토큰으로 업데이트됨');
        }
        
      } catch (parseError) {
        console.error('토큰 재발급 응답 파싱 실패:', parseError);
      }
      

      tokenRefreshCallbacks.forEach(callback => {
        try {
          callback(true);
        } catch (callbackError) {
          console.error('Token refresh callback error:', callbackError);
        }
      });
      
      return true;
    } else {
      let errorData = null;
      let errorText = '';
      
      try {
        const responseText = await response.text();
        try {
          errorData = JSON.parse(responseText);
          errorText = errorData.message || JSON.stringify(errorData);
        } catch (jsonError) {
          errorText = responseText;
        }
      } catch (parseError) {
        errorText = `HTTP ${response.status}`;
      }
      
      console.error('토큰 재발급 실패:', response.status, errorText);
      
      if (response.status === 401) {
        console.error('RefreshToken이 무효하거나 만료됨');
      } else if (response.status === 403) {
        console.error('RefreshToken 접근 권한 없음');
      } else if (response.status === 400) {
        console.error('잘못된 요청 형식');
      } else {
        console.error('기타 서버 에러');
      }
      
      const error = new Error(`Token refresh failed: ${response.status} - ${errorText}`);
      error.responseData = errorData;
      error.status = response.status;
      throw error;
    }
  } catch (refreshError) {
    console.error('Token refresh failed:', refreshError);
    console.error('에러 상세:', {
      name: refreshError.name,
      message: refreshError.message,
      status: refreshError.status,
      stack: refreshError.stack?.split('\n')[0]
    });
    
      console.log(`토큰 재발급 실패 콜백 호출: ${tokenRefreshCallbacks.length}개`);
    tokenRefreshCallbacks.forEach(callback => {
      try {
        callback(false);
      } catch (callbackError) {
        console.error('Token refresh callback error:', callbackError);
      }
    });
    
    if (refreshError.status === 401 || refreshError.status === 403) {
      console.error('RefreshToken 자체가 만료되었거나 무효함');
      const errorData = refreshError.responseData;
      if (!errorData || !errorData.silent) {
        handleAuthFailure('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      } else {

        clearAuthData();
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    } else if (refreshError.status >= 500) {
      console.error('서버 오류로 인한 토큰 재발급 실패');
      handleAuthFailure('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      const errorData = refreshError.responseData;
      if (!errorData || !errorData.silent) {
        handleAuthFailure('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else {

        clearAuthData();
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    
    throw refreshError;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

const handleAuthFailure = (message) => {

  resetTokenRefreshStatus();
  clearAuthData();
  
  if (message) {
    alert(message);
  }
  
  if (window.location.pathname !== '/') {

    window.location.href = '/';
  }
};

const clearAuthData = () => {

  clearAllAuthData();
};

export const apiCall = {
  get: (url, config = {}) => axiosInstance.get(url, { ...config, withCredentials: true }),
  post: (url, data = {}, config = {}) => axiosInstance.post(url, data, { ...config, withCredentials: true }),
  put: (url, data = {}, config = {}) => axiosInstance.put(url, data, { ...config, withCredentials: true }),
  delete: (url, config = {}) => axiosInstance.delete(url, { ...config, withCredentials: true }),
  patch: (url, data = {}, config = {}) => axiosInstance.patch(url, data, { ...config, withCredentials: true }),
};

export default axiosInstance;
export { clearAuthData, handleAuthFailure };