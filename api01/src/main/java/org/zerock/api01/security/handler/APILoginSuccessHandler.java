package org.zerock.api01.security.handler;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.zerock.api01.util.JWTUtil;

import java.io.IOException;
import java.util.Map;

@Log4j2
@RequiredArgsConstructor
public class APILoginSuccessHandler implements AuthenticationSuccessHandler {
  private final JWTUtil jwtUtil;

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
    log.info("Login success Handler...................................");
    // 반환할 jwt토큰의 타입은 JSON이므로 response의 컨텐츠 타입을 JSON으로 변경
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    log.info(authentication);
    log.info(authentication.getName());
    // 토큰에 저장할 데이터를 설정
    Map<String,Object> claim = Map.of("mid",authentication.getName());
    // 하루짜리 엑세스 토큰 생성
    String accessToken = jwtUtil.generateToken(claim, 1);
    // 30일짜리 리프레시 토큰 생성
    String refreshToken = jwtUtil.generateToken(claim, 30);

    Gson gson = new Gson();
    // map객체를 json 형식으로 변경
    Map<String,String> keyMap = Map.of("accessToken",accessToken,"refreshToken",refreshToken);
    String jsonStr = gson.toJson(keyMap);
    // response에 저장
    response.getWriter().println(jsonStr);
  }
}
