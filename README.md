# EZPZ - 여행 준비 통합 플랫폼

백엔드와 프론트엔드가 통합된 모노레포 구조입니다.

## 프로젝트 구조

```
EZPZ/
├── backend/          # Kotlin Spring Boot API
│   ├── src/
│   ├── build.gradle
│   └── ...
├── frontend/         # React + Vite 프론트엔드
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

## 시작하기

### 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

## 기술 스택

### 백엔드
- Kotlin
- Spring Boot 3.3.12
- Spring Security
- Spring Data JPA
- MariaDB
- Redis
- JWT

### 프론트엔드
- React 18
- Vite
- Axios
- CSS3

## 주요 기능

- 사용자 인증 (JWT 기반)
- 여행 체크리스트 관리
- 공항 주차 정보
- 금지물품 검색
- 게시판 시스템
- 평점 시스템

## 보안 강화 사항

- RSA-OAEP 암호화를 통한 토큰 보안
- RSASSA-PSS 디지털 서명
- 키 로테이션 시스템
- Redis 기반 세션 관리 