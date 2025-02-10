package org.zerock.ezpacking.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.zerock.ezpacking.domain.dto.response.TokenResponse;
import org.zerock.ezpacking.service.AuthService;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthService authService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                  @NonNull HttpServletResponse response,
                                  @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String accessToken = resolveToken(request);
            String refreshToken = resolveRefreshToken(request);

            if (StringUtils.hasText(accessToken)) {
                if (jwtTokenProvider.validateToken(accessToken)) {
                    processValidToken(accessToken);
                } else if (StringUtils.hasText(refreshToken)) {
                    processRefreshToken(refreshToken, response);
                } else {
                    handleTokenExpiration(response);
                }
            }
            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException e) {
            handleRefreshTokenExpiration(response);
        } catch (Exception e) {
            handleAuthenticationError(response, e);
        }
    }

    private void processValidToken(String accessToken) {
        Authentication authentication = jwtTokenProvider.getAuthentication(accessToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private void processRefreshToken(String refreshToken, HttpServletResponse response) throws IOException {
        try {
            TokenResponse newTokens = authService.refresh(refreshToken);
            Authentication newAuthentication = 
                jwtTokenProvider.getAuthentication(newTokens.getAccessToken());
            SecurityContextHolder.getContext().setAuthentication(newAuthentication);
            
            setTokenHeaders(response, newTokens);
        } catch (RuntimeException e) {
            handleRefreshTokenExpiration(response);
        }
    }

    private void setTokenHeaders(HttpServletResponse response, TokenResponse tokens) {
        response.setHeader("Authorization", "Bearer " + tokens.getAccessToken());
        response.setHeader("Refresh-Token", tokens.getRefreshToken());
    }

    private void handleRefreshTokenExpiration(HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        String errorResponse = "{\"message\":\"로그인이 만료되었습니다. 다시 로그인해주세요.\",\"code\":\"AUTH_EXPIRED\"}";
        response.getWriter().write(errorResponse);
    }

    private void handleTokenExpiration(HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        String errorResponse = "{\"message\":\"인증이 만료되었습니다.\",\"code\":\"TOKEN_EXPIRED\"}";
        response.getWriter().write(errorResponse);
    }

    private void handleAuthenticationError(HttpServletResponse response, Exception e) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        String errorResponse = String.format(
            "{\"message\":\"인증에 실패했습니다: %s\",\"code\":\"AUTH_ERROR\"}", 
            e.getMessage());
        response.getWriter().write(errorResponse);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private String resolveRefreshToken(HttpServletRequest request) {
        return request.getHeader("Refresh-Token");
    }
}