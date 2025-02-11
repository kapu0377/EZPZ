package org.zerock.api01.util;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Log4j2
public class JWTUtil {
  @Value("${org.zerock.jwt.secret}")
  private String key;

  public String generateToken(Map<String, Object> valueMap, int days){
    log.info("generateKey......."+key);
    Map<String,Object> headers = new HashMap<>();
    headers.put("typ","JWT");
    headers.put("alg","HS256");

    Map<String,Object> payloads = new HashMap<>();
    payloads.putAll(valueMap);
    //만료시간 설정
    int time = (60*24)*days;
    // JWT를 생성
//    String jwtStr = Jwts.builder()
//        .setHeader(headers)
//        .setClaims(payloads)
//        .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
//        .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(time).toInstant()))
//        .signWith(SignatureAlgorithm.HS256, key.getBytes())
//        .compact();
    SecretKey secretKey = Keys.hmacShaKeyFor(key.getBytes());
    String jwtStr = Jwts.builder()
        .header().add(headers).and()
        .claims(payloads)
        .issuedAt(Date.from(ZonedDateTime.now().toInstant()))
        .expiration(Date.from(ZonedDateTime.now().plusMinutes(time).toInstant()))
        .signWith(secretKey)
        .compact();
    return jwtStr;
  }
  public Map<String, Object> validateToken(String token) throws JwtException {
    Map<String,Object> claim = null;
    // 0.12.6 버전
    SecretKey secretKey = Keys.hmacShaKeyFor(key.getBytes());
    claim = Jwts.parser()
        .verifyWith(secretKey)
        .build()
        .parseSignedClaims(token)
        .getPayload();
    //    0.9.1 버전
//    claim = Jwts.parser()
//        .setSigningKey(key)
//        .parseClaimsJws(token)
//        .getBody();
    return claim;
  }
}
