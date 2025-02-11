package com.example.apiezpz.security;

import com.example.apiezpz.domain.APIUser;
import com.example.apiezpz.dto.APIUserDTO;
import com.example.apiezpz.repository.APIUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
@Log4j2
@RequiredArgsConstructor
public class APIUserDetailService implements UserDetailsService {
  private final APIUserRepository apiUserRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    // 데이터베이스에서 user정보를 취득
    Optional<APIUser> result = apiUserRepository.findById(Long.valueOf(username));
    // Optional데이터를 일반 entity로 변경
    APIUser apiUser = result.orElseThrow(() -> new UsernameNotFoundException(username));
    // Entity 데이터를 dto로 변경
    APIUserDTO dto = new APIUserDTO(
        apiUser.getUsername(),
        apiUser.getPassword(),
        List.of(new SimpleGrantedAuthority("ROLE_USER"))
    );
    // 완성한 dto데이터를 반환
    return dto;
  }
}
