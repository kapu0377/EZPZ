#!/bin/bash

echo "=========================================="
echo "    EZPZ 프로젝트 MySQL 설정 스크립트"
echo "=========================================="

# 실행 권한 부여
chmod +x setup_mysql.sh
chmod +x update_application_properties.sh
chmod +x update_gradle.sh

echo ""
echo "1. MySQL 설치 및 설정을 시작합니다..."
./setup_mysql.sh

echo ""
echo "2. application.properties를 MySQL용으로 업데이트합니다..."
./update_application_properties.sh

echo ""
echo "3. build.gradle을 MySQL용으로 업데이트합니다..."
./update_gradle.sh

echo ""
echo "4. MariaDB 서비스를 중지합니다..."
sudo systemctl stop mariadb
sudo systemctl disable mariadb

echo ""
echo "=========================================="
echo "           설정 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo "1. cd apiEZPZ"
echo "2. ./gradlew clean build"
echo "3. ./gradlew bootRun"
echo ""
echo "데이터베이스 정보:"
echo "- 데이터베이스: ezpz_db"
echo "- 사용자: ezpz_user"
echo "- 비밀번호: 1234"
echo "- 포트: 3306 (MySQL 기본 포트)" 