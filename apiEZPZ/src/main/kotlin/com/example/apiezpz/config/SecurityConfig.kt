package com.example.apiezpz.config

import com.example.apiezpz.auth.security.CustomUserDetailsService
import com.example.apiezpz.auth.security.JwtAuthenticationFilter
import com.example.apiezpz.auth.security.JwtTokenProvider
import com.example.apiezpz.auth.service.UserCacheService
import com.example.apiezpz.auth.service.RedisCacheService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val tokenProvider: JwtTokenProvider,
    private val customUserDetailsService: CustomUserDetailsService,
    private val userCacheService: UserCacheService,
    private val redisCacheService: RedisCacheService
) {

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOriginPatterns = listOf(
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "https://caff.pw",
            "http://caff.pw"
        )
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        configuration.exposedHeaders = listOf("Set-Cookie")
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.disable() }
            .csrf { it.disable() }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/api/auth/signup", "/api/auth/login").permitAll()
                    .requestMatchers("/api/auth/reissue").permitAll()
                    .requestMatchers("/api/posts/**").permitAll()
                    .requestMatchers("/api/comments/**").permitAll()
                    .requestMatchers("/api/search/**").permitAll()
                    .requestMatchers("/api/items/search").permitAll()
                    .requestMatchers("/api/user/info").permitAll()
                    .requestMatchers("/api/admin/token/**").authenticated()
                    .requestMatchers("/api/auth/**").authenticated()
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().permitAll()
            }
            .sessionManagement { session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }

        http.addFilterBefore(
            JwtAuthenticationFilter(tokenProvider, customUserDetailsService, userCacheService, redisCacheService),
            UsernamePasswordAuthenticationFilter::class.java
        )

        return http.build()
    }

    @Bean
    fun authenticationManager(configuration: AuthenticationConfiguration): AuthenticationManager {
        return configuration.authenticationManager
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }
} 