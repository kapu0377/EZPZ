import CryptoJS from 'crypto-js';

const generateStableBrowserFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('EZPZ-Fingerprint', 2, 2);
    
    const canvasFingerprint = canvas.toDataURL();
    const screenFingerprint = `${screen.availWidth}x${screen.availHeight}x${screen.colorDepth}`;
    const timezoneFingerprint = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const languageFingerprint = navigator.language || navigator.languages[0];
    
    return CryptoJS.SHA256(
      canvasFingerprint + 
      screenFingerprint + 
      timezoneFingerprint + 
      languageFingerprint
    ).toString();
  } catch (error) {
    return CryptoJS.SHA256(
      navigator.language + 
      screen.width + 
      screen.height + 
      'fallback-fingerprint'
    ).toString();
  }
};

const generateWeeklyTimeKey = () => {
  const now = new Date();
  const currentWeek = Math.floor(now.getTime() / (1000 * 60 * 60 * 24 * 7));
  return currentWeek;
};

const generateTimeKeys = () => {
  const currentWeek = generateWeeklyTimeKey();
  return [
    currentWeek,    
    currentWeek - 1  
  ];
};

const generateDynamicSalt = () => {
  const browserFingerprint = generateStableBrowserFingerprint();
  const randomComponent = generateSecureRandomKey();
  const timeComponent = Date.now().toString();
  
  return CryptoJS.SHA256(browserFingerprint + randomComponent + timeComponent).toString().substring(0, 32);
};

const generateUserKey = (timeKey = null) => {
  const browserFingerprint = generateStableBrowserFingerprint();
  const weekKey = timeKey || generateWeeklyTimeKey();
  
  return CryptoJS.SHA256(browserFingerprint + weekKey).toString();
};

export const encryptRefreshToken = (token) => {
  try {
    if (!token) return null;
    
    const userKey = generateUserKey();
    const dynamicSalt = generateDynamicSalt();
    const combinedKey = CryptoJS.SHA256(userKey + dynamicSalt).toString();
    
    const encrypted = CryptoJS.AES.encrypt(token, combinedKey).toString();
    
    const encryptedData = {
      data: encrypted,
      salt: dynamicSalt,
      week: generateWeeklyTimeKey(),
      timestamp: Date.now()
    };
    
    return btoa(JSON.stringify(encryptedData));
  } catch (error) {
    throw new Error('토큰 암호화 실패: ' + error.message);
  }
};

export const decryptRefreshToken = (encryptedToken) => {
  try {
    if (!encryptedToken) return null;
    
    const decoded = atob(encryptedToken);
    const encryptedData = JSON.parse(decoded);
    
    const timeKeys = generateTimeKeys();
    
    for (const timeKey of timeKeys) {
      try {
        const userKey = generateUserKey(timeKey);
        const combinedKey = CryptoJS.SHA256(userKey + encryptedData.salt).toString();
        
        const decrypted = CryptoJS.AES.decrypt(encryptedData.data, combinedKey);
        const originalToken = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (originalToken && isTokenValid(originalToken)) {
          return originalToken;
        }
      } catch (decryptError) {
        continue;
      }
    }
    
    throw new Error('토큰 복호화 실패');
  } catch (error) {
    throw new Error('토큰 복호화 실패: ' + error.message);
  }
};

export const setSecureItem = (key, value) => {
  try {
    if (key === 'refreshToken') {
      const encrypted = encryptRefreshToken(value);
      localStorage.setItem(key, encrypted);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    throw new Error('저장 실패: ' + error.message);
  }
};

export const getSecureItem = (key) => {
  try {
    const value = localStorage.getItem(key);
    
    if (key === 'refreshToken' && value) {
      return decryptRefreshToken(value);
    }
    
    return value;
  } catch (error) {
    throw new Error('조회 실패: ' + error.message);
  }
};

export const isTokenValid = (token) => {
  try {
    if (!token || typeof token !== 'string') return false;
    
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    
    if (!payload.sub || !payload.iat || !payload.exp) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp <= currentTime) return false;
    
    return true;
  } catch (error) {
    return false;
  }
};

export const removeSecureItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    throw new Error('제거 실패: ' + error.message);
  }
};

export const clearSecureStorage = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('refresh') || key.includes('token') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    throw new Error('저장소 정리 실패: ' + error.message);
  }
};

export const generateSecureRandomKey = () => {
  try {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    return CryptoJS.lib.WordArray.random(32).toString();
  }
};

export const hashData = (data) => {
  return CryptoJS.SHA256(data).toString();
};

export const verifyDataIntegrity = (data, expectedHash) => {
  const actualHash = hashData(data);
  return actualHash === expectedHash;
};

export const verifyTokenIntegrity = (token) => {
  try {
    if (!isTokenValid(token)) return false;
    
    const parts = token.split('.');
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    if (header.alg !== 'HS512') return false;
    if (!payload.sub || payload.sub.length < 3) return false;
    
    return true;
  } catch (error) {
    return false;
  }
}; 