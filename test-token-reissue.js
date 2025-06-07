// 토큰 재발급 테스트 스크립트
const BASE_URL = 'http://localhost:8080';

// 1. 로그인하여 토큰 획득
async function loginAndGetTokens() {
  console.log('🔐 로그인 테스트 시작...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      username: 'pjoonwoo99',
      password: 'qkrwnsdn12'
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ 로그인 성공');
    console.log('📊 응답 데이터:', data);
    
    // 쿠키에서 accessToken 확인
    const cookies = response.headers.get('set-cookie');
    console.log('🍪 설정된 쿠키:', cookies);
    
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
    },
    credentials: 'include',
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
    
    // 새로운 쿠키 확인
    const cookies = response.headers.get('set-cookie');
    console.log('🍪 새로 설정된 쿠키:', cookies);
    
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
  
  const response = await fetch(`${BASE_URL}/api/checklist/list`, {
    method: 'GET',
    credentials: 'include'
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

// 4. 종합 테스트 실행
async function runFullTest() {
  console.log('🚀 토큰 재발급 종합 테스트 시작\n');
  
  try {
    // 1단계: 로그인
    const loginData = await loginAndGetTokens();
    if (!loginData) {
      console.log('❌ 로그인 실패로 테스트 중단');
      return;
    }
    
    // 2단계: 인증 API 테스트 (로그인 직후)
    console.log('\n--- 로그인 직후 API 테스트 ---');
    await testAuthenticatedAPI();
    
    // 3단계: 토큰 재발급 테스트
    const reissueData = await testTokenReissue(loginData.refreshToken);
    if (!reissueData) {
      console.log('❌ 토큰 재발급 실패로 테스트 중단');
      return;
    }
    
    // 4단계: 재발급 후 API 테스트
    console.log('\n--- 토큰 재발급 후 API 테스트 ---');
    await testAuthenticatedAPI();
    
    // 5단계: 리프레시 토큰이 바뀌었는지 확인
    console.log('\n--- 토큰 변경 여부 확인 ---');
    if (loginData.refreshToken !== reissueData.refreshToken) {
      console.log('🔄 리프레시 토큰이 새로 발급되었습니다');
      console.log('🔄 기존:', loginData.refreshToken.substring(0, 50) + '...');
      console.log('🔄 신규:', reissueData.refreshToken.substring(0, 50) + '...');
    } else {
      console.log('✅ 리프레시 토큰이 유지되었습니다');
    }
    
    console.log('\n🎉 모든 테스트 완료!');
    
  } catch (error) {
    console.error('💥 테스트 중 오류 발생:', error);
  }
}

// 테스트 실행
runFullTest(); 