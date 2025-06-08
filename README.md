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
├── setup_all.sh      # Linux/macOS용 MySQL 설정 스크립트
└── README.md
```

## 빠른 시작

### 자동 설정 (권장)
**Linux/macOS:**
```bash
chmod +x setup_all.sh
./setup_all.sh
```

**Windows:**
```cmd
setup_all.bat
```

### 수동 설정

#### 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

#### 프론트엔드 실행

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
- MariaDB/MySQL
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
- Redis 기반 토큰관리

## 데이터베이스 설정

자동 설정 스크립트를 사용하면 다음 정보로 MySQL 데이터베이스가 구성됩니다:

- **데이터베이스**: ezpz_db
- **사용자**: ezpz_user  
- **비밀번호**: 1234
- **포트**: 3306

## Redis 설정 (도커 사용)

프로젝트에서  토큰 관리를 위해 Redis를 사용합니다.

### Redis 시작

```bash
# 레디스 도커 컨테이너 시작
chmod +x scripts/start-redis.sh
./scripts/start-redis.sh
```

### Redis 중지

```bash
# 레디스 도커 컨테이너 중지
chmod +x scripts/stop-redis.sh
./scripts/stop-redis.sh
```

### Redis 수동 실행

```bash
# 도커 컴포즈로 직접 실행
docker-compose -f docker-compose.redis.yml up -d

# 중지
docker-compose -f docker-compose.redis.yml down
```

### Redis 접속 정보

- **호스트**: localhost
- **포트**: 6379
- **비밀번호**: ezpz_redis_password
- 임시로 지정해둔 값이므로 바꾸는것을 적극 권장

