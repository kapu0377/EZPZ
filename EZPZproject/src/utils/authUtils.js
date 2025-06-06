import { setSecureItem, getSecureItem, isTokenValid, removeSecureItem, clearSecureStorage, verifyTokenIntegrity } from './cryptoUtils';


export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};


export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};


export const checkAuthStatus = () => {
  const refreshToken = getSecureItem('refreshToken');
  const isValidToken = refreshToken && isTokenValid(refreshToken);
  const accessToken = getCookie('accessToken');
  
  return {
    hasRefreshToken: !!refreshToken,
    hasAccessToken: !!accessToken,
    isAuthenticated: isValidToken,
    needsRefresh: isValidToken && !accessToken 
  };
};


export const clearAllAuthData = () => {
  removeSecureItem('refreshToken');
  clearSecureStorage();
  sessionStorage.clear();
  deleteCookie('accessToken');
  console.log('모든 인증 데이터가 안전하게 정리되었습니다.');
};


export const saveAuthTokens = (data) => {
  if (data.refreshToken) {
    setSecureItem('refreshToken', data.refreshToken);
    console.log('토큰이 안전하게 저장되었습니다.');
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('토큰 파싱 실패:', error);
    return true;
  }
};


export const isRefreshTokenExpired = () => {
  const refreshToken = getSecureItem('refreshToken');
  return isTokenExpired(refreshToken);
};


export const validateTokenWhenNeeded = () => {
  const refreshToken = getSecureItem('refreshToken');
  
  // 토큰이 없으면 바로 false 반환
  if (!refreshToken) {
    return { isValid: false, reason: 'NO_TOKEN' };
  }
  
  // 개선된 토큰 무결성 검증 사용
  if (!verifyTokenIntegrity(refreshToken)) {
    return { isValid: false, reason: 'INVALID_FORMAT' };
  }
  
  // 만료 시간 확인은 이미 verifyTokenIntegrity에서 처리됨
  return { isValid: true };
};


export const requireAuthWithValidation = (onRequireLogin) => {
  const validation = validateTokenWhenNeeded();
  
  if (!validation.isValid) {
    console.log('토큰 검증 실패:', validation.reason);
    if (onRequireLogin) {
      onRequireLogin();
    }
    return false;
  }
  
  return true;
};


export const verifyAuthWithServer = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include' 
    });
    
    const isValid = response.ok;
    return isValid;
  } catch (error) {
    console.error('서버 인증 상태 확인 실패:', error);
    return false;
  }
};


export const getUsernameFromToken = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch (error) {
    console.error('토큰에서 사용자명 추출 실패:', error);
    return null;
  }
};


export const getUsernameFromRefreshToken = () => {
  const refreshToken = getSecureItem('refreshToken');
  return getUsernameFromToken(refreshToken);
};


export const refreshAccessToken = async () => {
  const refreshToken = getSecureItem('refreshToken');
  
  if (!refreshToken || isTokenExpired(refreshToken)) {
    throw new Error('RefreshToken이 없거나 만료되었습니다.');
  }
  
  try {
    const response = await fetch('/api/auth/reissue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        refreshToken,
        username: getUsernameFromToken(refreshToken) || ""
      })
    });
    
    if (!response.ok) {
      throw new Error('토큰 갱신 실패');
    }
    
    const data = await response.json();
    
    if (data.refreshToken && data.refreshToken !== refreshToken) {
      setSecureItem('refreshToken', data.refreshToken);
      console.log('새로운 리프레시 토큰으로 업데이트됨');
    }
    
    return data;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    clearAllAuthData();
    throw error;
  }
};


export const secureLogout = async () => {
  const refreshToken = getSecureItem('refreshToken');
  
  try {
    if (refreshToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken })
      });
    }
  } catch (error) {
    console.error('서버 로그아웃 요청 실패:', error);
  } finally {
    clearAllAuthData();
  }
};


export const validateTokenIntegrity = () => {
  const refreshToken = getSecureItem('refreshToken');

  if (!refreshToken) {
    return { isValid: false, reason: 'NO_TOKEN' };
  }
  
  // 개선된 무결성 검증 사용
  if (!verifyTokenIntegrity(refreshToken)) {
    return { isValid: false, reason: 'INTEGRITY_FAILED' };
  }
  
  return { isValid: true };
};


export const checkAndRefreshTokenIfNeeded = async () => {
  const refreshToken = getSecureItem('refreshToken');
  
  if (!refreshToken) {
    console.log('리프레시 토큰이 없습니다.');
    return { success: false, reason: 'NO_REFRESH_TOKEN' };
  }
  
  if (isTokenExpired(refreshToken)) {
    console.log('리프레시 토큰이 만료되었습니다.');
    return { success: false, reason: 'REFRESH_TOKEN_EXPIRED' };
  }
  
  const accessToken = getCookie('accessToken');
  
  if (!accessToken) {
    console.log('액세스 토큰이 없습니다. 재발급을 시도합니다.');
    try {
      await refreshAccessToken();
      console.log('토큰 재발급 성공');
      return { success: true, reason: 'TOKEN_REFRESHED' };
    } catch (error) {
      console.error('토큰 재발급 실패:', error);
      return { success: false, reason: 'REFRESH_FAILED', error };
    }
  }
  
  console.log('토큰 상태 정상');
  return { success: true, reason: 'TOKEN_VALID' };
}; 