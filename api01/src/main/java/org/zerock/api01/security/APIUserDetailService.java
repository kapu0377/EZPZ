package org.zerock.api01.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.zerock.api01.domain.APIUser;
import org.zerock.api01.dto.APIUserDTO;
import org.zerock.api01.repository.APIUserRepository;

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
    Optional<APIUser> result = apiUserRepository.findById(username);
    // Optional데이터를 일반 entity로 변경
    APIUser apiUser = result.orElseThrow(() -> new UsernameNotFoundException(username));
    // Entity 데이터를 dto로 변경
    APIUserDTO dto = new APIUserDTO(
        apiUser.getMid(),
        apiUser.getMpw(),
        List.of(new SimpleGrantedAuthority("ROLE_USER"))
    );
    // 완성한 dto데이터를 반환
    return dto;
  }
}
