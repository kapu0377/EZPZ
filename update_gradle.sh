#!/bin/bash

echo "=== build.gradle MySQL 드라이버 추가 ==="

GRADLE_FILE="apiEZPZ/build.gradle"

# 백업 생성
cp "$GRADLE_FILE" "$GRADLE_FILE.backup"

# MariaDB 드라이버를 MySQL 드라이버로 교체
sed -i 's/implementation.*mariadb-java-client.*/implementation '\''mysql:mysql-connector-java:8.0.33'\''/' "$GRADLE_FILE"

echo "build.gradle이 업데이트되었습니다."
echo "MariaDB 드라이버 → MySQL 드라이버로 변경"
echo "백업 파일: $GRADLE_FILE.backup"

# 변경사항 확인
echo ""
echo "변경된 의존성:"
grep -n "mysql" "$GRADLE_FILE" || echo "MySQL 드라이버가 추가되지 않았습니다. 수동으로 추가해주세요." 