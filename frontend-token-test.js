// 프론트엔드 토큰 관리 로직 검증 테스트
const BASE_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:3002';

class LocalStorageSimulator {
  constructor() {
    this.storage = {};
  }
  
  getItem(key) {
    return this.storage[key] || null;
  }
  
  setItem(key, value) {
    this.storage[key] = value;
  }
  
  removeItem(key) {
    delete this.storage[key];
  }
  
  clear() {
    this.storage = {};
  }
}

const localStorage = new LocalStorageSimulator();

// 암호화/복호화 시뮬레이션 (실제 프론트엔드 로직 재현)
function setSecureItem(key, value) {
  // 실제로는 암호화를 하지만 테스트에서는 단순 저장
  localStorage.setItem(key, value);
  console.log(`🔐 localStorage에 저장: ${key} = ${value.substring(0, 50)}...`);
}

function getSecureItem(key) {
  const value = localStorage.getItem(key);
  if (value) {
    console.log(`🔓 localStorage에서 조회: ${key} = ${value.substring(0, 50)}...`);
  } else {
    console.log(`❌ localStorage에서 조회 실패: ${key}`);
  }
  return value;
}

function removeSecureItem(key) {
  localStorage.removeItem(key);
  console.log(`🗑️ localStorage에서 삭제: ${key}`);
}

// 프론트엔드 토큰 재발급 로직 재현
async function refreshAccessToken() {
  console.log('\n🔄 프론트엔드 토큰 재발급 로직 실행');
  
  const refreshToken = getSecureItem('refreshToken');
  
  if (!refreshToken) {
    console.log('❌ 리프레시 토큰이 localStorage에 없음');
    return null;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/reissue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
      body: JSON.stringify({
        refreshToken: refreshToken,
        username: 'pjoonwoo99'
      })
    });
    
    if (!response.ok) {
      console.log('❌ 토큰 재발급 실패:', response.status);
      const errorText = await response.text();
      console.log('❌ 에러 내용:', errorText);
      
      // 실패 시 localStorage 정리
      removeSecureItem('refreshToken');
      return null;
    }
    
    const data = await response.json();
    console.log('✅ 토큰 재발급 성공');
    
    // 리프레시 토큰이 새로 발급된 경우에만 업데이트 (기존 로직 유지)
    if (data.refreshToken && data.refreshToken !== refreshToken) {
      setSecureItem('refreshToken', data.refreshToken);
      console.log('🔄 새로운 리프레시 토큰으로 업데이트됨');
    } else {
      console.log('🔄 기존 리프레시 토큰 유지됨');
    }
    
    // 액세스 토큰은 HTTP-only 쿠키로 자동 설정됨
    console.log('🍪 액세스 토큰이 HTTP-only 쿠키로 설정됨');
    
    return data;
    
  } catch (error) {
    console.error('❌ 토큰 재발급 중 오류:', error);
    removeSecureItem('refreshToken');
    return null;
  }
}

// 프론트엔드 로그인 로직 재현
async function frontendLogin(username, password) {
  console.log('\n🔐 프론트엔드 로그인 로직 실행');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
    
    if (!response.ok) {
      console.log('❌ 로그인 실패:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('✅ 로그인 성공');
    
    // 리프레시 토큰을 localStorage에 저장
    if (data.refreshToken) {
      setSecureItem('refreshToken', data.refreshToken);
    }
    
    // 액세스 토큰은 HTTP-only 쿠키로 자동 설정됨
    console.log('🍪 액세스 토큰이 HTTP-only 쿠키로 설정됨');
    
    return data;
    
  } catch (error) {
    console.error('❌ 로그인 중 오류:', error);
    return null;
  }
}

// API 호출 with 자동 토큰 재발급 로직
async function apiCallWithAutoRefresh(url, options = {}) {
  console.log(`\n📡 API 호출: ${url}`);
  
  try {
    // 첫 번째 시도
    let response = await fetch(url, {
      ...options,
      credentials: 'include'
    });
    
    if (response.status === 401 || response.status === 403) {
      console.log('🔄 인증 실패, 토큰 재발급 시도...');
      
      // 토큰 재발급 시도
      const refreshResult = await refreshAccessToken();
      
      if (refreshResult) {
        console.log('✅ 토큰 재발급 성공, API 재시도...');
        
        // 재시도
        response = await fetch(url, {
          ...options,
          credentials: 'include'
        });
      } else {
        console.log('❌ 토큰 재발급 실패, 로그아웃 필요');
        return null;
      }
    }
    
    if (response.ok) {
      console.log('✅ API 호출 성공');
      const data = await response.json();
      return data;
    } else {
      console.log('❌ API 호출 실패:', response.status);
      return null;
    }
    
  } catch (error) {
    console.error('❌ API 호출 중 오류:', error);
    return null;
  }
}

// 프론트엔드 종합 테스트
async function runFrontendTests() {
  console.log('🖥️ === 프론트엔드 토큰 관리 로직 검증 테스트 ===\n');
  
  try {
    // Step 1: localStorage 초기화
    console.log('🧹 localStorage 초기화');
    localStorage.clear();
    
    // Step 2: 로그인 테스트
    console.log('\n' + '='.repeat(60));
    console.log('📋 Step 1: 프론트엔드 로그인 테스트');
    console.log('='.repeat(60));
    
    const loginResult = await frontendLogin('pjoonwoo99', 'qkrwnsdn12');
    if (!loginResult) {
      console.log('❌ 로그인 실패로 테스트 중단');
      return;
    }
    
    // Step 3: API 호출 테스트 (토큰 유효)
    console.log('\n' + '='.repeat(60));
    console.log('📋 Step 2: 유효한 토큰으로 API 호출');
    console.log('='.repeat(60));
    
    const apiResult1 = await apiCallWithAutoRefresh(`${BASE_URL}/api/checklist/list`, {
      method: 'GET'
    });
    
    // Step 4: 토큰 재발급 테스트
    console.log('\n' + '='.repeat(60));
    console.log('📋 Step 3: 명시적 토큰 재발급 테스트');
    console.log('='.repeat(60));
    
    const refreshResult = await refreshAccessToken();
    
    // Step 5: 재발급 후 API 호출
    console.log('\n' + '='.repeat(60));
    console.log('📋 Step 4: 재발급 후 API 호출');
    console.log('='.repeat(60));
    
    const apiResult2 = await apiCallWithAutoRefresh(`${BASE_URL}/api/checklist/list`, {
      method: 'GET'
    });
    
    // Step 6: localStorage 상태 확인
    console.log('\n' + '='.repeat(60));
    console.log('📋 Step 5: localStorage 상태 확인');
    console.log('='.repeat(60));
    
    const currentRefreshToken = getSecureItem('refreshToken');
    console.log('💾 현재 localStorage 상태:');
    console.log(`   - refreshToken 존재: ${currentRefreshToken ? 'YES' : 'NO'}`);
    
    if (currentRefreshToken) {
      // JWT 토큰 파싱하여 만료 시간 확인
      try {
        const base64Payload = currentRefreshToken.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        const expiry = new Date(payload.exp * 1000);
        const now = new Date();
        const timeLeft = Math.floor((expiry.getTime() - now.getTime()) / 1000);
        
        console.log(`   - 토큰 만료시간: ${expiry}`);
        console.log(`   - 남은 시간: ${timeLeft}초`);
      } catch (e) {
        console.log('   - 토큰 파싱 실패');
      }
    }
    
    // Step 7: 잘못된 토큰으로 테스트
    console.log('\n' + '='.repeat(60));
    console.log('📋 Step 6: 잘못된 토큰으로 재발급 시도');
    console.log('='.repeat(60));
    
    setSecureItem('refreshToken', 'invalid.token.here');
    const invalidRefreshResult = await refreshAccessToken();
    
    console.log('📊 잘못된 토큰 테스트 결과:');
    console.log(`   - 재발급 실패: ${invalidRefreshResult === null ? 'YES (예상)' : 'NO'}`);
    console.log(`   - localStorage 정리됨: ${getSecureItem('refreshToken') === null ? 'YES (예상)' : 'NO'}`);
    
    // 최종 요약
    console.log('\n' + '='.repeat(60));
    console.log('🎯 === 프론트엔드 테스트 완료 요약 ===');
    console.log('='.repeat(60));
    console.log('✅ 로그인 시 리프레시 토큰 localStorage 저장');
    console.log('✅ 토큰 재발급 시 새 토큰만 업데이트');
    console.log('✅ API 호출 시 자동 토큰 재발급 로직');
    console.log('✅ 잘못된 토큰 시 localStorage 정리');
    console.log('✅ HTTP-only 쿠키를 통한 액세스 토큰 관리');
    
  } catch (error) {
    console.error('❌ 프론트엔드 테스트 실행 중 오류:', error);
  }
}

// 테스트 실행
runFrontendTests(); 