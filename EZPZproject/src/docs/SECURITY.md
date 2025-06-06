# 리프레쉬 토큰 보안 시스템

## 개요
EZPZ 프로젝트에서는 리프레쉬 토큰의 보안을 강화하기 위해 다음과 같은 다층 보안 조치들을 구현했습니다.

## 주요 보안 기능

### 1. 클라이언트 암호화
- **주별 시간 키**: 주별 변경으로 안정성 향상
- **Grace Period**: 키 변경 시점의 호환성 보장 (현재주 + 이전주)
- **안정적인 브라우저 지문**: Canvas fingerprint + 시간대 + 언어 조합
- **완전 동적 Salt**: 브라우저 지문 + 랜덤 키 + 타임스탬프 조합으로 매번 고유한 Salt 생성

### 2. 백엔드 암호화 저장
- **AES-GCM 암호화**: 백엔드 DB 및 Redis에 토큰 암호화 저장
- **무결성 보장**: GCM 모드로 암호화와 동시에 무결성 검증
- **IV 랜덤화**: 각 암호화마다 고유한 초기화 벡터 사용
- **환경변수 키**: 하드코딩된 키 제거, 환경변수로 관리

### 3. 강화된 토큰 검증
- **다단계 검증**: 구조 → 필드 → 만료시간 → 알고리즘 순차 검증
- **무결성 검증**: JWT 구조와 페이로드 완전성 확인

## 구현된 보안 함수들

### cryptoUtils.js
```javascript
- generateStableBrowserFingerprint(): 안정적인 브라우저 지문 생성
- generateWeeklyTimeKey(): 주별 시간 키 생성
- generateTimeKeys(): Grace Period 키 배열 생성
- generateDynamicSalt(): 완전 동적 Salt 생성 (브라우저 지문 + 랜덤 + 시간)
- encryptRefreshToken(): Salt 포함 암호화
- decryptRefreshToken(): Grace Period 지원 복호화
- setSecureItem(): 암호화된 저장
- getSecureItem(): 복호화된 조회
- isTokenValid(): JWT 토큰 유효성 검증
- verifyTokenIntegrity(): 토큰 무결성 검증
```

### TokenEncryptionService.kt
```kotlin
- encryptToken(): AES-GCM 암호화
- decryptToken(): AES-GCM 복호화
- isEncrypted(): 암호화 여부 확인
- verifyTokenIntegrity(): 토큰 무결성 검증
```

### RedisCacheService.kt
```kotlin
- cacheRefreshToken(): 암호화된 토큰 캐시 저장
- getCachedRefreshToken(): 복호화된 토큰 조회
- removeRefreshTokenCache(): 토큰 캐시 삭제
- blacklistAccessToken(): 액세스 토큰 블랙리스트
```

## 보안 강화 사항

### 동적 Salt 생성
- 브라우저 지문 + 보안 랜덤 키 + 타임스탬프 조합
- 매번 고유한 Salt로 레인보우 테이블 공격 방지
- 시간 기반 요소로 재생 공격 방지

### 암호화 데이터 구조
```json
{
  "data": "암호화된_토큰_데이터",
  "salt": "동적_생성된_솔트",
  "week": "주별_시간_키",
  "timestamp": "생성_시간"
}
```

### 에러 처리
- 암호화/복호화 실패 시 예외 발생
- 명확한 에러 메시지로 디버깅 지원
- 보안 실패 시 즉시 중단

## 보안 고려사항

1. **키 관리**: 환경변수로 암호화 키 관리
2. **Salt 무작위성**: crypto.getRandomValues() 사용
3. **시간 기반 보안**: 주별 키 변경으로 장기 공격 방지
4. **무결성 검증**: GCM 모드로 변조 감지
5. **에러 보안**: 실패 시 명확한 예외 처리
