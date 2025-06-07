#!/bin/bash

echo "=== application.properties MySQL 설정 업데이트 ==="

# application.properties 파일 경로
PROPS_FILE="apiEZPZ/src/main/resources/application.properties"

# 백업 생성
cp "$PROPS_FILE" "$PROPS_FILE.backup"

# MySQL 설정으로 업데이트
cat > "$PROPS_FILE" << 'EOF'
spring.application.name=apiEZPZ

server.port=8080

# MySQL 설정
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/ezpz_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul
spring.datasource.username=ezpz_user
spring.datasource.password=1234

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.show-sql=false
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect

logging.level.org.springframework=info
logging.level.org.zerock=debug
logging.level.org.springframework.security=debug
logging.level.com.example.apiezpz.auth.security=debug
logging.level.com.example.apiezpz.auth.service=INFO

jwt.secret=mySecretKey
jwt.access-token-expiration=86400000
jwt.refresh-token-expiration=604800000

spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.timeout=60000ms

spring.jackson.time-zone=Asia/Tokyo
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.deserialization.fail-on-unknown-properties=false

spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=always

# RSA Token encryption settings
app.token.rsa.key.size=3072
app.token.rsa.keystore.path=./keystore/ezpz-token-keys.p12
app.token.rsa.keystore.password=EZPZ-SecureKeystore-2024!
app.token.rsa.key.alias=ezpz-current-key
app.token.rsa.key.rotation.days=90

# Admin user settings
admin.user.id= pjoonwoo99
EOF

echo "application.properties가 MySQL 설정으로 업데이트되었습니다."
echo "백업 파일: $PROPS_FILE.backup" 