#!/bin/bash

echo "=== MariaDB 설정 수정 스크립트 ==="

# 1. MariaDB 서비스 재시작
echo "1. MariaDB 서비스 재시작 중..."
sudo systemctl restart mariadb

# 2. root 사용자 비밀번호 설정 (MariaDB 문법)
echo "2. root 사용자 비밀번호 설정 중..."
sudo mariadb -e "SET PASSWORD FOR 'root'@'localhost' = PASSWORD('1234');"
sudo mariadb -e "FLUSH PRIVILEGES;"

# 3. ezpz_user 삭제 후 재생성
echo "3. ezpz_user 재생성 중..."
sudo mariadb -u root -p1234 -e "DROP USER IF EXISTS 'ezpz_user'@'localhost';"
sudo mariadb -u root -p1234 -e "CREATE USER 'ezpz_user'@'localhost' IDENTIFIED BY '1234';"
sudo mariadb -u root -p1234 -e "GRANT ALL PRIVILEGES ON ezpz_db.* TO 'ezpz_user'@'localhost';"
sudo mariadb -u root -p1234 -e "GRANT ALL PRIVILEGES ON *.* TO 'ezpz_user'@'localhost';"
sudo mariadb -u root -p1234 -e "FLUSH PRIVILEGES;"

# 4. 데이터베이스 생성
echo "4. 데이터베이스 생성 중..."
sudo mariadb -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS ezpz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. 연결 테스트
echo "5. 연결 테스트 중..."
mariadb -u ezpz_user -p1234 -e "SELECT 'MariaDB 연결 성공!' AS status;"

# 6. 사용자 권한 확인
echo "6. 사용자 권한 확인 중..."
sudo mariadb -u root -p1234 -e "SHOW GRANTS FOR 'ezpz_user'@'localhost';"

echo "=== MariaDB 설정 완료 ==="
echo "데이터베이스: ezpz_db"
echo "사용자: ezpz_user"
echo "비밀번호: 1234"
echo ""
echo "MariaDB 서비스 상태:"
sudo systemctl status mariadb --no-pager 