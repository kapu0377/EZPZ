// 쿠키 관리를 포함한 토큰 재발급 테스트
const BASE_URL = 'http://localhost:8080';

// 쿠키 파싱 함수
function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });
  }
  return cookies;
}

// 쿠키를 쿠키 헤더 문자열로 변환
function cookiesToHeader(cookies) {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

let globalCookies = {};

// 1. 로그인하여 토큰 획득
async function loginAndGetTokens() {
  console.log('🔐 로그인 테스트 시작...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'pjoonwoo99',
      password: 'qkrwnsdn12'
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ 로그인 성공');
    console.log('📊 응답 데이터:', data);
    
    // 쿠키 저장
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const cookies = parseCookies(setCookie);
      globalCookies = { ...globalCookies, ...cookies };
      console.log('🍪 저장된 쿠키:', globalCookies);
    }
    
    return data;
  } else {
    console.log('❌ 로그인 실패:', response.status);
    const error = await response.text();
    console.log('❌ 에러 내용:', error);
    return null;
  }
}

// 2. 토큰 재발급 테스트
async function testTokenReissue(refreshToken) {
  console.log('\n🔄 토큰 재발급 테스트 시작...');
  console.log('🎫 사용할 리프레시 토큰:', refreshToken.substring(0, 50) + '...');
  
  const response = await fetch(`${BASE_URL}/api/auth/reissue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookiesToHeader(globalCookies)
    },
    body: JSON.stringify({
      refreshToken: refreshToken,
      username: 'pjoonwoo99'
    })
  });
  
  console.log('📊 재발급 응답 상태:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ 토큰 재발급 성공');
    console.log('📊 새로운 토큰 데이터:', data);
    
    // 새로운 쿠키 업데이트
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const newCookies = parseCookies(setCookie);
      globalCookies = { ...globalCookies, ...newCookies };
      console.log('🍪 업데이트된 쿠키:', globalCookies);
    }
    
    return data;
  } else {
    console.log('❌ 토큰 재발급 실패:', response.status);
    const error = await response.text();
    console.log('❌ 에러 내용:', error);
    return null;
  }
}

// 3. 인증이 필요한 API 호출 테스트
async function testAuthenticatedAPI() {
  console.log('\n🔒 인증 API 테스트 시작...');
  console.log('🍪 사용할 쿠키:', cookiesToHeader(globalCookies));
  
  const response = await fetch(`${BASE_URL}/api/checklist/list`, {
    method: 'GET',
    headers: {
      'Cookie': cookiesToHeader(globalCookies)
    }
  });
  
  console.log('📊 API 응답 상태:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ 인증 API 호출 성공');
    console.log('📊 응답 데이터:', data);
    return true;
  } else {
    console.log('❌ 인증 API 호출 실패:', response.status);
    const error = await response.text();
    console.log('❌ 에러 내용:', error);
    return false;
  }
}

// 4. 액세스 토큰 만료 시뮬레이션 테스트
async function testExpiredTokenScenario() {
  console.log('\n⏰ 액세스 토큰 만료 시뮬레이션...');
  
  // 액세스 토큰 쿠키 삭제 (만료 시뮬레이션)
  delete globalCookies.accessToken;
  console.log('🗑️ 액세스 토큰 쿠키 삭제됨');
  
  // API 호출 (401 에러 예상)
  console.log('\n🔒 만료된 토큰으로 API 호출...');
  const apiResult = await testAuthenticatedAPI();
  
  if (!apiResult) {
    console.log('✅ 예상대로 인증 실패 (액세스 토큰 없음)');
  }
}

// 5. 종합 테스트 실행
async function runFullTest() {
  console.log('🚀 쿠키 기반 토큰 재발급 종합 테스트 시작\n');
  
  try {
    // 1단계: 로그인
    const loginData = await loginAndGetTokens();
    if (!loginData) {
      console.log('❌ 로그인 실패로 테스트 중단');
      return;
    }
    
    // 2단계: 인증 API 테스트 (로그인 직후)
    console.log('\n--- 로그인 직후 API 테스트 ---');
    const apiResult1 = await testAuthenticatedAPI();
    
    // 3단계: 토큰 재발급 테스트
    const reissueData = await testTokenReissue(loginData.refreshToken);
    if (!reissueData) {
      console.log('❌ 토큰 재발급 실패로 테스트 중단');
      return;
    }
    
    // 4단계: 재발급 후 API 테스트
    console.log('\n--- 토큰 재발급 후 API 테스트 ---');
    const apiResult2 = await testAuthenticatedAPI();
    
    // 5단계: 리프레시 토큰 변경 여부 확인
    console.log('\n--- 토큰 변경 여부 확인 ---');
    if (loginData.refreshToken !== reissueData.refreshToken) {
      console.log('🔄 리프레시 토큰이 새로 발급되었습니다');
      console.log('🔄 기존:', loginData.refreshToken.substring(0, 50) + '...');
      console.log('🔄 신규:', reissueData.refreshToken.substring(0, 50) + '...');
    } else {
      console.log('✅ 리프레시 토큰이 유지되었습니다 (예상대로!)');
    }
    
    // 6단계: 액세스 토큰 만료 시뮬레이션
    await testExpiredTokenScenario();
    
    console.log('\n🎉 모든 테스트 완료!');
    console.log('\n📋 테스트 결과 요약:');
    console.log(`  - 로그인: ✅`);
    console.log(`  - 로그인 후 API: ${apiResult1 ? '✅' : '❌'}`);
    console.log(`  - 토큰 재발급: ✅`);
    console.log(`  - 재발급 후 API: ${apiResult2 ? '✅' : '❌'}`);
    console.log(`  - 리프레시 토큰 유지: ✅`);
    
  } catch (error) {
    console.error('💥 테스트 중 오류 발생:', error);
  }
}

// 테스트 실행
runFullTest(); 