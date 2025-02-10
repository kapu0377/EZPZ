package org.zerock.ezpacking.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {
    private final RedisTemplate<String, String> redisTemplate;
    
    public void blacklistToken(String token, long expirationTime) {
        String key = "blacklist:" + token;
        redisTemplate.opsForValue().set(key, "blacklisted", expirationTime, TimeUnit.MILLISECONDS);
        log.info("Token added to blacklist: {}", token);
    }
    
    public boolean isBlacklisted(String token) {
        String key = "blacklist:" + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
} 