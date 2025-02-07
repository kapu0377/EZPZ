package org.zerock.api01.security.filter;

import com.google.gson.Gson;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;
import org.zerock.api01.security.exception.RefreshTokenException;
import org.zerock.api01.util.JWTUtil;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Log4j2
@RequiredArgsConstructor
public class RefreshTokenFilter extends OncePerRequestFilter {
  private final String refreshPath;
  private final JWTUtil jwtUtil;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    String path = request.getRequestURI();
    // 실제 실행된 path와 CustomSecurityConfig에서 설정한 path가 같은지 확인
    if(!path.equals(refreshPath)) {
      log.info("skip refresh token filter.............");
      filterChain.doFilter(request, response);
      return;
    }
    log.info("Refresh Token Filter...run..............1");
    Map<String,String> tokens = parseRequestJSON(request);
    String accessToken = tokens.get("accessToken");
    String refreshToken = tokens.get("refreshToken");
    log.info("accessToken: "+accessToken);
    log.info("refreshToken: "+refreshToken);

    try{
      checkAccessToken(accessToken);
    }catch(RefreshTokenException refreshTokenException){
      refreshTokenException.sendResponseError(response);
    }
    Map<String, Object> refreshClaims = null;
    try{
      refreshClaims = checkRefreshToken(refreshToken);
      log.info(refreshClaims);
      //RefreshToken의 유효기간이 얼마 남지 않은 경우
      Long exp = (Long)refreshClaims.get("exp");
      // 만료시간을 date 자료형으로
      Date expTime = new Date(Instant.ofEpochMilli(exp).toEpochMilli()*1000);
      // 현재 시간을 date 자료형으로
      Date current = new Date(System.currentTimeMillis());
      //3일 미만인 경우에는 RefreshToken 다시 생성
      long gapTime = (expTime.getTime() - current.getTime());
      log.info("---------------------");
      log.info("current: "+current);
      log.info("expTime: "+expTime);
      log.info("gap: "+gapTime);
      // 토큰 갱신시 저장할 데이터 설정
      String mid = (String)refreshClaims.get("mid");
      // accessToken을 새로 생성
      String accessTokenValue = jwtUtil.generateToken(Map.of("mid",mid),1);
      String refreshTokenValue = tokens.get("refreshToken");
      if(gapTime < (1000*60*60*24*3)){
        log.info("new Refresh Token required... ");
        refreshTokenValue = jwtUtil.generateToken(Map.of("mid",mid),1);
      }
      log.info("Refresh Token result..............");
      log.info("accessTokenValue: "+accessTokenValue);
      log.info("refreshTokenValue: "+refreshTokenValue);
      sendTokens(accessTokenValue,refreshTokenValue,response);
    }catch(RefreshTokenException refreshTokenException){
      refreshTokenException.sendResponseError(response);
    }
  }
  private Map<String,String> parseRequestJSON(HttpServletRequest request) {
    try(Reader reader = new InputStreamReader(request.getInputStream())){
      Gson gson = new Gson();
      return gson.fromJson(reader, Map.class);
    }catch(Exception e){
      log.error(e.getMessage());
    }
    return null;
  }
  private void checkAccessToken(String accessToken) throws RefreshTokenException {
    try{
      jwtUtil.validateToken(accessToken);
    }catch(ExpiredJwtException e){
      log.info("Access Token has expired");
    }catch(Exception e){
      throw new RefreshTokenException(RefreshTokenException.ErrorCase.NO_ACCESS);
    }
  }
  private Map<String,Object> checkRefreshToken(String refreshToken) throws RefreshTokenException{
    try{
      Map<String, Object> values = jwtUtil.validateToken(refreshToken);
      return values;
    }catch(ExpiredJwtException expiredJwtException){
      throw new RefreshTokenException(RefreshTokenException.ErrorCase.OLD_REFRESH);
    }catch (MalformedJwtException malformedJwtException){
      throw new RefreshTokenException(RefreshTokenException.ErrorCase.BAD_REFRESH);
    }catch(Exception exception){
      new RefreshTokenException(RefreshTokenException.ErrorCase.NO_REFRESH);
    }
    return null;
  }
  private void sendTokens(String accessTokenValue, String refreshTokenValue, HttpServletResponse response){
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    Gson gson = new Gson();
    String jsonStr = gson.toJson(Map.of("accessToken",accessTokenValue, "refreshToken",refreshTokenValue));
    try{
      response.getWriter().println(jsonStr);
    }catch(IOException e){
      throw new RuntimeException(e);
    }
  }
}
