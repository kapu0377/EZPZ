// 브라우저 콘솔에서 실행할 토큰 디버깅 스크립트
// 개발자 도구 콘솔에 복사해서 실행하세요

console.log('🔧 토큰 디버깅 스크립트 로드됨');

// 1. 현재 저장된 토큰 상태 확인
const rawToken = localStorage.getItem('refreshToken');
console.log('🔍 Raw localStorage refreshToken:', rawToken);

// 2. 쿠키 상태 확인
console.log('🍪 현재 쿠키:', document.cookie);

// 3. 리프레시 토큰에서 사용자명 추출 함수
function extractUsernameFromToken(token) {
  try {
    if (!token) return null;
    
    // Base64 디코딩
    const decoded = atob(token);
    console.log('📝 디코딩된 토큰:', decoded);
    
    // JWT 형식인 경우 파싱 시도
    if (decoded.includes('.')) {
      const parts = decoded.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('🎯 JWT 페이로드:', payload);
        return payload.sub || payload.username || payload.user;
      }
    }
    
    // 다른 형식의 토큰에서 사용자명 추출 시도
    return null;
  } catch (error) {
    console.log('⚠️ 토큰 파싱 실패:', error.message);
    return null;
  }
}

// 4. 올바른 형식으로 토큰 재발급 테스트
async function testTokenReissueWithUsername() {
  if (!rawToken) {
    console.log('❌ 리프레시 토큰이 없습니다.');
    return;
  }
  
  const username = extractUsernameFromToken(rawToken);
  console.log('👤 추출된 사용자명:', username);
  
  if (!username) {
    console.log('⚠️ 토큰에서 사용자명을 추출할 수 없습니다. 수동으로 입력하세요:');
    console.log('testTokenReissueManual("your_username")');
    return;
  }
  
  try {
    console.log('🔄 토큰 재발급 요청 중... (username 포함)');
    
    const response = await fetch('/api/auth/reissue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        refreshToken: rawToken,
        username: username
      })
    });
    
    console.log('📊 재발급 응답 상태:', response.status);
    
    if (response.ok) {
      console.log('✅ 토큰 재발급 성공!');
      console.log('🍪 새로운 쿠키:', document.cookie);
    } else {
      const errorText = await response.text();
      console.log('❌ 재발급 실패:', errorText);
    }
  } catch (error) {
    console.log('❌ 재발급 테스트 실패:', error.message);
  }
}

// 5. 수동으로 사용자명을 지정하는 함수
async function testTokenReissueManual(username) {
  if (!rawToken) {
    console.log('❌ 리프레시 토큰이 없습니다.');
    return;
  }
  
  if (!username) {
    console.log('❌ 사용자명을 입력해주세요.');
    return;
  }
  
  try {
    console.log('🔄 수동 토큰 재발급 요청 중...');
    console.log('👤 사용자명:', username);
    
    const response = await fetch('/api/auth/reissue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        refreshToken: rawToken,
        username: username
      })
    });
    
    console.log('📊 재발급 응답 상태:', response.status);
    
    if (response.ok) {
      console.log('✅ 토큰 재발급 성공!');
      console.log('🍪 새로운 쿠키:', document.cookie);
      location.reload(); // 페이지 새로고침으로 인증 상태 업데이트
    } else {
      const errorText = await response.text();
      console.log('❌ 재발급 실패:', errorText);
    }
  } catch (error) {
    console.log('❌ 재발급 테스트 실패:', error.message);
  }
}

// 6. 사용 가능한 함수들 등록
window.testTokenReissueWithUsername = testTokenReissueWithUsername;
window.testTokenReissueManual = testTokenReissueManual;
window.extractUsernameFromToken = extractUsernameFromToken;

console.log('🎯 사용 가능한 함수들:');
console.log('  - testTokenReissueWithUsername(): 자동 사용자명 추출 + 토큰 재발급');
console.log('  - testTokenReissueManual("username"): 수동 사용자명 지정 + 토큰 재발급');
console.log('  - extractUsernameFromToken(token): 토큰에서 사용자명 추출');

// 7. 자동 실행
console.log('🚀 자동으로 토큰 재발급을 시도합니다...');
testTokenReissueWithUsername(); 