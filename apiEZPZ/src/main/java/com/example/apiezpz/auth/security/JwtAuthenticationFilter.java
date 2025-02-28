package com.example.apiezpz.auth.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final AntPathRequestMatcher reissueMatcher = new AntPathRequestMatcher("/api/auth/reissue", "POST");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (reissueMatcher.matches(request)) {
            log.debug("재발급 요청이므로 JWT 필터를 건너뜁니다, uri: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }
        try {
            String token = resolveToken(request);

            if (StringUtils.hasText(token)) {
                if (tokenProvider.validateToken(token)) {
                    String username = tokenProvider.getUsernameFromToken(token);
                    if (username != null) {
                        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("Security Context에 '{}' 인증 정보를 저장했습니다, uri: {}", username, request.getRequestURI());
                    } else {
                        log.warn("유효한 토큰이지만 username(subject)을 추출할 수 없습니다. Token: {}", token);
                    }
                } else {
                    log.debug("유효하지 않은 JWT 토큰입니다. uri: {}", request.getRequestURI());
                }
            } else {
                log.debug("요청 헤더에 유효한 JWT 토큰이 없습니다, uri: {}", request.getRequestURI());
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("JWT 필터 처리 중 예기치 않은 오류 발생", e);
            filterChain.doFilter(request, response);
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization"); // "Bearer <access_token>"
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}