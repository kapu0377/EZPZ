package org.zerock.api01.security.filter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.filter.OncePerRequestFilter;
import org.zerock.api01.security.exception.AccessTokenException;
import org.zerock.api01.util.JWTUtil;

import java.io.IOException;
import java.util.Map;

@Log4j2
@RequiredArgsConstructor
public class TokenCheckFilter extends OncePerRequestFilter {
  private final JWTUtil jwtUtil;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    // http://localhost:8080/api/sample/doA
    // http:// : 프로토콜
    // localhost : 호스트
    // 8080 : 포트
    // /api/sample/doA : path
    //패스의 첫부분에 /api/ 가 있으면 토큰 필터를 실행하도록 설정
    String path = request.getRequestURI();
    if(!path.startsWith("/api/")){
      filterChain.doFilter(request, response);
    }
    log.info("Token check Filter..............................");
    log.info("JWTUtil: " + jwtUtil);

    try{
      validateAccessToken(request);
      filterChain.doFilter(request,response);
    }catch(AccessTokenException accessTokenException){
      accessTokenException.sendResponseError(response);
    }
  }
  private Map<String, Object> validateAccessToken(HttpServletRequest request) throws AccessTokenException{
    String headerStr = request.getHeader("Authorization");


    if(headerStr == null || headerStr.length() < 8){
      throw new AccessTokenException(AccessTokenException.TOKEN_ERROR.UNACCEPT);
    }
    //    postman의 Bearer token으로 보낼때 토큰 앞에 Bearer 글자가 붙어서 토큰이 저장됨
    String tokenType = headerStr.substring(0,6);
    String tokenStr = headerStr.substring(7);
    if(tokenType.equals("Bearer") == false){
      throw new AccessTokenException(AccessTokenException.TOKEN_ERROR.BADTYPE);
    }

    try{
      Map<String,Object> values = jwtUtil.validateToken(tokenStr);
      return values;
    }catch(MalformedJwtException malformedJwtException){
      log.error("MalformedJwtException--------------------");
      throw new AccessTokenException(AccessTokenException.TOKEN_ERROR.MALFORM);
    }catch(SignatureException signatureException){
      log.error("SignatureException--------------------");
      throw new AccessTokenException(AccessTokenException.TOKEN_ERROR.BADSIGN);
    }catch(ExpiredJwtException expiredJwtException){
      log.error("ExpiredJwtException--------------------");
      throw new AccessTokenException(AccessTokenException.TOKEN_ERROR.EXPIRED);
    }
  }
}
