package org.zerock.ezpacking.security;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Getter
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;
    @Value("${jwt.access-token-validity}")
    private long accessTokenValidityInMilliseconds;
    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidityInMilliseconds;
    private final UserDetailsService userDetailsService;

    @PostConstruct
    protected void init() {
        secretKey = Base64.getEncoder().encodeToString(secretKey.getBytes());
        log.info("JWT Provider has been initialized.");
    }

    public Map<String, String> createAccessToken(Map<String, Object> claims) {
        log.debug("Access Token 생성 시작: {}", claims);
        
        String mid = claims.get("mid").toString();
        claims.put("type", "access");
        
        String accessToken = createToken(claims, accessTokenValidityInMilliseconds);
        String refreshToken = createRefreshToken(mid);
        
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        
        log.debug("토큰 생성 완료 - mid: {}", mid);
        return tokens;
    }

    public String createRefreshToken(String mid) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("mid", mid);
        claims.put("type", "refresh");
        return createToken(claims, refreshTokenValidityInMilliseconds);
    }

    public String createToken(Map<String, Object> claims, long validityInMilliseconds) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        try {
            log.info("Starting token creation - claims: {}, expiration: {}", claims, validity);
            String token = Jwts.builder()
                    .setClaims(claims)
                    .setIssuedAt(now)
                    .setExpiration(validity)
                    .signWith(SignatureAlgorithm.HS256, secretKey)
                    .compact();

            log.info("Token creation successful: {}", token);
            return token;
        } catch (Exception e) {
            log.error("Error occurred while creating token", e);
            throw new JwtTokenCreationException("An error occurred while creating the token.");
        }
    }

    public Authentication getAuthentication(String token) {
        log.debug("Starting authentication extraction from token.");
        Claims claims = extractAllClaims(token);
        String mid = claims.get("mid", String.class);

        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(mid);
            return new UsernamePasswordAuthenticationToken(
                    userDetails, "", userDetails.getAuthorities());
        } catch (Exception e) {
            log.error("Error occurred while extracting authentication info", e);
            throw new JwtAuthenticationException("Unable to extract authentication information from token.");
        }
    }

    public String getMid(String token) {
        log.debug("Starting extraction of mid from token.");
        Claims claims = extractAllClaims(token);
        return claims.get("mid", String.class);
    }

    public Claims extractAllClaims(String token) {
        try {
            log.info("Starting claim extraction from token: {}", token);
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token)
                    .getBody();
            log.info("Extracted claims: {}", claims);
            return claims;
        } catch (ExpiredJwtException e) {
            log.error("JWT token has expired: {}", e.getMessage());
            throw new JwtTokenExpiredException("The token has expired.");
        } catch (JwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            throw new JwtValidationException("The token is invalid.");
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("만료된 토큰입니다: {}", e.getMessage());
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("유효하지 않은 토큰입니다: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Date expiration = claims.getExpiration();
            return expiration.before(new Date());
        } catch (JwtTokenExpiredException e) {
            return true;
        } catch (Exception e) {
            return true;
        }
    }

    public long getRefreshTokenRemainingTime(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getExpiration().getTime() - System.currentTimeMillis();
    }

    public static class JwtTokenCreationException extends RuntimeException {
        public JwtTokenCreationException(String message) {
            super(message);
        }
    }

    public static class JwtTokenExpiredException extends RuntimeException {
        public JwtTokenExpiredException(String message) {
            super(message);
        }
    }

    public static class JwtValidationException extends RuntimeException {
        public JwtValidationException(String message) {
            super(message);
        }
    }

    public static class JwtAuthenticationException extends RuntimeException {
        public JwtAuthenticationException(String message) {
            super(message);
        }
    }

}
