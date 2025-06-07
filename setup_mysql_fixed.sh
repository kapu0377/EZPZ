#!/bin/bash

echo "=== MySQL 설치 및 설정 스크립트 (Debian용) ==="

# 1. MariaDB 서비스 중지
echo "1. 기존 MariaDB 서비스 중지 중..."
sudo systemctl stop mariadb
sudo systemctl disable mariadb

# 2. MySQL APT 저장소 추가
echo "2. MySQL APT 저장소 추가 중..."
cd /tmp
wget https://dev.mysql.com/get/mysql-apt-config_0.8.29-1_all.deb
sudo dpkg -i mysql-apt-config_0.8.29-1_all.deb
sudo apt update

# 3. MySQL 서버 설치
echo "3. MySQL 서버 설치 중..."
sudo apt install mysql-server -y

# 4. MySQL 서비스 시작 및 활성화
echo "4. MySQL 서비스 시작 중..."
sudo systemctl start mysql
sudo systemctl enable mysql

# 5. MySQL 보안 설정 (MariaDB와 다른 문법 사용)
echo "5. MySQL 보안 설정 중..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1234';"
sudo mysql -u root -p1234 -e "DELETE FROM mysql.user WHERE User='';"
sudo mysql -u root -p1234 -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
sudo mysql -u root -p1234 -e "DROP DATABASE IF EXISTS test;"
sudo mysql -u root -p1234 -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
sudo mysql -u root -p1234 -e "FLUSH PRIVILEGES;"

# 6. 데이터베이스 및 사용자 생성
echo "6. 데이터베이스 및 사용자 생성 중..."
sudo mysql -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS ezpz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -u root -p1234 -e "CREATE USER IF NOT EXISTS 'ezpz_user'@'localhost' IDENTIFIED BY '1234';"
sudo mysql -u root -p1234 -e "GRANT ALL PRIVILEGES ON ezpz_db.* TO 'ezpz_user'@'localhost';"
sudo mysql -u root -p1234 -e "FLUSH PRIVILEGES;"

# 7. 연결 테스트
echo "7. 연결 테스트 중..."
mysql -u ezpz_user -p1234 -e "SELECT 'MySQL 연결 성공!' AS status;"

echo "=== MySQL 설정 완료 ==="
echo "데이터베이스: ezpz_db"
echo "사용자: ezpz_user"
echo "비밀번호: 1234"
echo ""
echo "MySQL 서비스 상태 확인:"
sudo systemctl status mysql --no-pager 