// 토큰 재발급 디버깅 스크립트
console.log('🔧 토큰 재발급 디버깅 스크립트 로드됨');

// 현재 상태 확인 함수
function checkCurrentStatus() {
    console.log('📊 === 현재 상태 확인 ===');
    
    // 쿠키 확인
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});
    
    console.log('🍪 쿠키:', cookies);
    console.log('🔑 accessToken 쿠키:', cookies.accessToken ? '존재함' : '없음');
    
    // localStorage 확인
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('🔄 refreshToken:', refreshToken ? '존재함' : '없음');
    
    // AuthContext 상태 확인 (React DevTools 필요)
    try {
        const authStatus = window.checkAuthStatus ? window.checkAuthStatus() : 'checkAuthStatus 함수 없음';
        console.log('🔐 인증 상태:', authStatus);
    } catch (error) {
        console.log('🔐 인증 상태 확인 실패:', error.message);
    }
}

// accessToken 쿠키 삭제 함수
function deleteAccessTokenCookie() {
    console.log('🗑️ accessToken 쿠키 삭제 중...');
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('✅ accessToken 쿠키 삭제 완료');
    checkCurrentStatus();
}

// 인증이 필요한 API 호출 테스트
async function testAuthenticatedAPI() {
    console.log('🧪 === 인증 API 테스트 시작 ===');
    
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        });
        
        console.log('📡 응답 상태:', response.status);
        console.log('📡 응답 헤더:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API 호출 성공:', data);
        } else {
            console.log('❌ API 호출 실패:', response.status, response.statusText);
        }
    } catch (error) {
        console.log('💥 API 호출 에러:', error);
    }
    
    // 호출 후 상태 다시 확인
    setTimeout(checkCurrentStatus, 1000);
}

// axios를 통한 API 호출 테스트
async function testAxiosAPI() {
    console.log('🧪 === Axios API 테스트 시작 ===');
    
    try {
        // axios 인스턴스가 있는지 확인
        if (typeof axios !== 'undefined') {
            const response = await axios.get('/api/auth/me');
            console.log('✅ Axios 호출 성공:', response.data);
        } else {
            console.log('❌ axios가 정의되지 않음');
        }
    } catch (error) {
        console.log('💥 Axios 호출 에러:', error);
        console.log('에러 상세:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
    }
    
    // 호출 후 상태 다시 확인
    setTimeout(checkCurrentStatus, 1000);
}

// 전체 테스트 시나리오
async function runFullTest() {
    console.log('🚀 === 전체 테스트 시나리오 시작 ===');
    
    console.log('\n1️⃣ 초기 상태 확인');
    checkCurrentStatus();
    
    console.log('\n2️⃣ accessToken 쿠키 삭제');
    deleteAccessTokenCookie();
    
    console.log('\n3️⃣ 3초 후 인증 API 호출 테스트');
    setTimeout(async () => {
        await testAuthenticatedAPI();
        
        console.log('\n4️⃣ 5초 후 Axios API 호출 테스트');
        setTimeout(testAxiosAPI, 5000);
    }, 3000);
}

// 전역 함수로 등록
window.checkCurrentStatus = checkCurrentStatus;
window.deleteAccessTokenCookie = deleteAccessTokenCookie;
window.testAuthenticatedAPI = testAuthenticatedAPI;
window.testAxiosAPI = testAxiosAPI;
window.runFullTest = runFullTest;

console.log('🎯 사용 가능한 함수들:');
console.log('  - checkCurrentStatus(): 현재 상태 확인');
console.log('  - deleteAccessTokenCookie(): accessToken 쿠키 삭제');
console.log('  - testAuthenticatedAPI(): 인증 API 직접 호출');
console.log('  - testAxiosAPI(): Axios를 통한 API 호출');
console.log('  - runFullTest(): 전체 테스트 시나리오 실행');

console.log('\n🔥 빠른 테스트: runFullTest() 실행'); 