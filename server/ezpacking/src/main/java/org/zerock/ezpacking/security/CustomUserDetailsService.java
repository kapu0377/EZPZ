package org.zerock.ezpacking.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.ezpacking.domain.entity.User;
import org.zerock.ezpacking.repository.UserRepository;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String mid) throws UsernameNotFoundException {
        return userRepository.findByMid(mid)
                .map(this::createUserDetails)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with mid: " + mid));
    }

    private UserDetails createUserDetails(User user) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().name());

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getMid())
                .password(user.getPassword())
                .authorities(Collections.singleton(authority))
                .build();
    }
}