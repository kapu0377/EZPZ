package com.example.apiezpz.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.zerock.api01.security.APIUserDetailService;
import org.zerock.api01.security.filter.TokenCheckFilter;
import org.zerock.api01.util.JWTUtil;

import java.util.Arrays;

@Configuration
@Log4j2
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class CustomSecurityConfig {
  private final APIUserDetailService apiUserDetailService;
  private final JWTUtil jwtUtil;
  @Bean
  //비밀번호 암호화 설정
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
  @Bean
  // 정적 파일 시큐리티 해제 설정
  public WebSecurityCustomizer webSecurityCustomizer() {
    return (web) -> web.ignoring()
        .requestMatchers(PathRequest.toStaticResources().atCommonLocations());
  }
  @Bean
  public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {

//    //권한 매니저 빌더 설정
//    AuthenticationManagerBuilder authenticationManagerBuilder =
//        http.getSharedObject(AuthenticationManagerBuilder.class);
//    // 권한 매니저 빌더에 user확인 처리 및 비밀번호 암호화 처리 설정
//    authenticationManagerBuilder
//        .userDetailsService(apiUserDetailService)
//            .passwordEncoder(passwordEncoder());
//    // 권한 매니저 생성
//    AuthenticationManager authenticationManager = authenticationManagerBuilder.build();
//    // http에 권한 매니저 설정
//    http.authenticationManager(authenticationManager);
//    // APILoginFilter 생성 : 토큰 생성 url(주소) 설정
//    APILoginFilter apiLoginFilter = new APILoginFilter("/generateToken");
//    // apiLoginFilter에 권한 매니저 설정
//    apiLoginFilter.setAuthenticationManager(authenticationManager);
//    // 로그인 성공시 실행할 핸들러 설정
//    APILoginSuccessHandler successHandler = new APILoginSuccessHandler(jwtUtil);
//    apiLoginFilter.setAuthenticationSuccessHandler(successHandler);
//    // http에 필터 설정, 유저 이름이나 패스워드 권한 관련 필터 전에 실행되도록 설정
//    http.addFilterBefore(apiLoginFilter, UsernamePasswordAuthenticationFilter.class);
//
//    http.addFilterBefore(tokenCheckFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);
//
//    //refreshTokenFilter 설정
//    http.addFilterBefore(new RefreshTokenFilter("/refreshToken", jwtUtil), TokenCheckFilter.class);

    //csrf설정 비활성화
    http.csrf().disable();
    //session 비활성화 : jsessionid가 생성되지 않음
    http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

    http.cors(httpSecurityCorsConfigurer ->
        httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource()));

    return http.build();
  }
  private TokenCheckFilter tokenCheckFilter(JWTUtil jwtUtil) {
    return new TokenCheckFilter(jwtUtil);
  }
  @Bean
  public CorsConfigurationSource corsConfigurationSource(){
    CorsConfiguration configuration = new CorsConfiguration();
//    허용할 주소 설정
    configuration.setAllowedOriginPatterns(Arrays.asList("*"));
//    허용할 메서드 설정
    configuration.setAllowedMethods(Arrays.asList("HEAD","GET", "POST", "PUT", "DELETE"));
//    헤더에 담을 수 있는 데이터 이름 설정
    configuration.setAllowedHeaders(Arrays.asList("Authorization","Cache-Control","Content-Type"));
    configuration.setAllowCredentials(true);
//    반환값 설정
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**",configuration);
    return source;
  }
}











