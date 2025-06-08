#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}EZPZ 프로젝트 자동 설정을 시작합니다...${NC}"

# MySQL 설정
echo -e "${YELLOW}MySQL 데이터베이스 설정 중...${NC}"

# MySQL 서비스 시작 확인
if ! systemctl is-active --quiet mysql; then
    echo -e "${YELLOW}MySQL 서비스를 시작합니다...${NC}"
    sudo systemctl start mysql
fi

# 데이터베이스 및 사용자 생성
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS ezpz_db;
CREATE USER IF NOT EXISTS 'ezpz_user'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON ezpz_db.* TO 'ezpz_user'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MySQL 데이터베이스 설정 완료${NC}"
else
    echo -e "${RED}❌ MySQL 설정 실패${NC}"
    exit 1
fi

# Redis 도커 설정
echo -e "${YELLOW}Redis 도커 컨테이너 설정 중...${NC}"

# 스크립트 실행 권한 부여
chmod +x scripts/*.sh

# Redis 컨테이너 시작
./scripts/start-redis.sh

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Redis 도커 설정 완료${NC}"
else
    echo -e "${RED}❌ Redis 설정 실패${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 EZPZ 프로젝트 설정이 완료되었습니다!${NC}"
echo -e "${BLUE}다음 단계:${NC}"
echo -e "  1. 백엔드 실행: cd backend && ./gradlew bootRun"
echo -e "  2. 프론트엔드 실행: cd frontend && npm install && npm run dev"
echo -e "${YELLOW}Redis 관리:${NC}"
echo -e "  - Redis 중지: ./scripts/stop-redis.sh"
echo -e "  - Redis 시작: ./scripts/start-redis.sh" 