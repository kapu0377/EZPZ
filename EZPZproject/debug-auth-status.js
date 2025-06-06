// 인증 상태 및 쿠키 디버깅 스크립트
// 브라우저 개발자 도구 콘솔에서 실행하세요

console.log('🔍 인증 상태 디버깅 시작');

// 1. 현재 쿠키 상태 확인
function checkCookies() {
  console.log('🍪 모든 쿠키:', document.cookie);
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});
  
  console.log('📋 파싱된 쿠키:', cookies);
  console.log('🔑 accessToken 쿠키:', cookies.accessToken ? '존재함' : '없음');
  
  if (cookies.accessToken) {
    try {
      // JWT 토큰 디코딩 시도
      const tokenParts = cookies.accessToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('🎯 AccessToken 페이로드:', payload);
        console.log('⏰ 만료 시간:', new Date(payload.exp * 1000));
        console.log('🕐 현재 시간:', new Date());
        console.log('⚠️ 만료 여부:', payload.exp * 1000 < Date.now());
      }
    } catch (error) {
      console.log('⚠️ AccessToken 디코딩 실패:', error.message);
    }
  }
  
  return cookies;
}

// 2. 리프레시 토큰 상태 확인
function checkRefreshToken() {
  const rawRefreshToken = localStorage.getItem('refreshToken');
  console.log('🔄 localStorage의 refreshToken:', rawRefreshToken ? '존재함' : '없음');
  
  if (rawRefreshToken) {
    try {
      // Base64 디코딩 후 JWT 파싱 시도
      const decoded = atob(rawRefreshToken);
      if (decoded.includes('.')) {
        const tokenParts = decoded.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🎯 RefreshToken 페이로드:', payload);
          console.log('⏰ 만료 시간:', new Date(payload.exp * 1000));
          console.log('🕐 현재 시간:', new Date());
          console.log('⚠️ 만료 여부:', payload.exp * 1000 < Date.now());
        }
      }
    } catch (error) {
      console.log('⚠️ RefreshToken 디코딩 실패:', error.message);
    }
  }
}

// 3. /api/auth/me 직접 테스트 (실제 구현된 엔드포인트)
async function testAuthStatus() {
  console.log('🔍 /api/auth/me 직접 테스트 (인증 상태 확인)');
  
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // 쿠키 포함
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 응답 상태:', response.status);
    console.log('📋 응답 헤더:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 성공 응답:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ 오류 응답:', errorText);
      
      if (response.status === 403) {
        console.log('🚫 403 Forbidden - 가능한 원인:');
        console.log('  1. AccessToken이 만료됨');
        console.log('  2. AccessToken이 유효하지 않음');
        console.log('  3. 쿠키가 제대로 전송되지 않음');
        console.log('  4. 서버에서 토큰을 인식하지 못함');
      }
    }
  } catch (error) {
    console.log('❌ 네트워크 오류:', error.message);
  }
}

// 4. 수동 토큰 재발급 테스트
async function forceTokenRefresh() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.log('❌ RefreshToken이 없습니다.');
    return;
  }
  
  try {
    console.log('🔄 강제 토큰 재발급 시도');
    
    // 사용자명을 토큰에서 추출하거나 기본값 사용
    let username = '';
    try {
      const decoded = atob(refreshToken);
      if (decoded.includes('.')) {
        const parts = decoded.split('.');
        const payload = JSON.parse(atob(parts[1]));
        username = payload.sub || payload.username || payload.user || '';
      }
    } catch (e) {
      console.log('⚠️ RefreshToken에서 사용자명 추출 실패');
    }
    
    const response = await fetch('/api/auth/reissue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        refreshToken,
        username
      })
    });
    
    console.log('📊 재발급 응답 상태:', response.status);
    
    if (response.ok) {
      console.log('✅ 토큰 재발급 성공!');
      console.log('🔄 인증 상태를 다시 확인합니다...');
      
      // 재발급 후 다시 테스트
      setTimeout(() => {
        testAuthStatus();
      }, 1000);
    } else {
      const errorText = await response.text();
      console.log('❌ 재발급 실패:', errorText);
    }
    
  } catch (error) {
    console.log('❌ 재발급 중 오류:', error.message);
  }
}

// 5. 종합 디버깅 함수
async function comprehensiveDebug() {
  console.log('🎯 === 종합 인증 디버깅 시작 ===');
  
  console.log('\n1️⃣ 쿠키 상태 확인:');
  checkCookies();
  
  console.log('\n2️⃣ RefreshToken 상태 확인:');
  checkRefreshToken();
  
  console.log('\n3️⃣ 인증 상태 API 테스트:');
  await testAuthStatus();
  
  console.log('\n🎯 === 디버깅 완료 ===');
  
  console.log('\n📝 다음 단계:');
  console.log('  - 만약 AccessToken이 만료되었다면: forceTokenRefresh() 실행');
  console.log('  - 문제가 지속되면 로그아웃 후 다시 로그인');
}

// 함수들을 전역에 등록
window.checkCookies = checkCookies;
window.checkRefreshToken = checkRefreshToken;
window.testAuthStatus = testAuthStatus;
window.forceTokenRefresh = forceTokenRefresh;
window.comprehensiveDebug = comprehensiveDebug;

console.log('🎯 사용 가능한 함수들:');
console.log('  - comprehensiveDebug(): 종합 디버깅');
console.log('  - testAuthStatus(): 인증 상태 API 테스트');
console.log('  - forceTokenRefresh(): 강제 토큰 재발급');
console.log('  - checkCookies(): 쿠키 상태 확인');
console.log('  - checkRefreshToken(): RefreshToken 상태 확인');

// 자동 실행
console.log('🚀 자동으로 종합 디버깅을 시작합니다...');
comprehensiveDebug(); 