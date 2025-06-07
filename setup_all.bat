@echo off
chcp 65001 >nul
echo ==========================================
echo     EZPZ 프로젝트 MySQL 설정 스크립트 (Windows)
echo ==========================================

echo.
echo MySQL 설치 확인 중...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] MySQL이 설치되지 않았습니다.
    echo MySQL을 먼저 설치해주세요: https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)

echo MySQL이 설치되어 있습니다.
echo.

echo 1. MySQL 서비스 시작 중...
net start mysql >nul 2>&1
if %errorlevel% neq 0 (
    echo MySQL 서비스가 이미 실행 중이거나 시작할 수 없습니다.
)

echo.
echo 2. MySQL 데이터베이스 및 사용자 설정 중...
echo MySQL root 비밀번호를 입력하세요:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ezpz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'ezpz_user'@'localhost' IDENTIFIED BY '1234'; GRANT ALL PRIVILEGES ON ezpz_db.* TO 'ezpz_user'@'localhost'; FLUSH PRIVILEGES;"

if %errorlevel% neq 0 (
    echo [오류] 데이터베이스 설정에 실패했습니다.
    pause
    exit /b 1
)

echo.
echo 3. application.properties를 MySQL용으로 업데이트 중...
cd backend
if not exist "src\main\resources\application.properties" (
    echo [오류] application.properties 파일을 찾을 수 없습니다.
    pause
    exit /b 1
)

echo # MySQL Configuration > src\main\resources\application.properties.new
echo spring.datasource.url=jdbc:mysql://localhost:3306/ezpz_db?useSSL=false^&serverTimezone=Asia/Seoul^&characterEncoding=UTF-8 >> src\main\resources\application.properties.new
echo spring.datasource.username=ezpz_user >> src\main\resources\application.properties.new
echo spring.datasource.password=1234 >> src\main\resources\application.properties.new
echo spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver >> src\main\resources\application.properties.new
echo. >> src\main\resources\application.properties.new
echo # JPA Configuration >> src\main\resources\application.properties.new
echo spring.jpa.hibernate.ddl-auto=update >> src\main\resources\application.properties.new
echo spring.jpa.show-sql=true >> src\main\resources\application.properties.new
echo spring.jpa.properties.hibernate.format_sql=true >> src\main\resources\application.properties.new
echo spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect >> src\main\resources\application.properties.new

move src\main\resources\application.properties src\main\resources\application.properties.backup >nul
move src\main\resources\application.properties.new src\main\resources\application.properties >nul

echo.
echo 4. build.gradle MySQL 의존성 확인 중...
findstr /C:"mysql-connector-j" build.gradle >nul
if %errorlevel% neq 0 (
    echo MySQL 의존성을 build.gradle에 추가해야 합니다.
    echo 수동으로 다음 의존성을 추가하세요:
    echo implementation 'com.mysql:mysql-connector-j'
)

cd ..

echo.
echo ==========================================
echo            설정 완료!
echo ==========================================
echo.
echo 다음 단계:
echo 1. cd backend
echo 2. gradlew.bat clean build
echo 3. gradlew.bat bootRun
echo.
echo 데이터베이스 정보:
echo - 데이터베이스: ezpz_db
echo - 사용자: ezpz_user
echo - 비밀번호: 1234
echo - 포트: 3306 (MySQL 기본 포트)
echo.
pause 