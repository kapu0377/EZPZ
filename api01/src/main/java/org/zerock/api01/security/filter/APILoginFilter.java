package org.zerock.api01.security.filter;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Map;

@Log4j2
public class APILoginFilter extends AbstractAuthenticationProcessingFilter {
  public APILoginFilter(String defaultFilterProcessingUrl) {
    super(defaultFilterProcessingUrl);
  }
  @Override
  public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
    log.info("APILoginFilter-------------------------------------------");
    // get 메서드의 경우 토큰을 생성하지 않음
    if(request.getMethod().equalsIgnoreCase("GET")){
      log.info("GET METHOD NOT SUPPORT");
      return null;
    }
    // request에 있는 json데이터를 저장
    Map<String, String> jsonData = parseRequestJSON(request);
    // json데이터에서 받은 id와 비밀번호로 토큰 생성
    UsernamePasswordAuthenticationToken authenticationToken =
        new UsernamePasswordAuthenticationToken(
            jsonData.get("mid"),
            jsonData.get("mpw")
        );
    return getAuthenticationManager().authenticate(authenticationToken);
  }
  private Map<String, String> parseRequestJSON(HttpServletRequest request) {
    try(Reader reader = new InputStreamReader(request.getInputStream())) {
      // Gson 라이브러리를 사용하여 json데이터를 Map<String,String> 데이터로 변환
      Gson gson = new Gson();
      return gson.fromJson(reader, Map.class);
    }catch(Exception e){
      log.error(e.getMessage());
    }
    return null;
  }
}
