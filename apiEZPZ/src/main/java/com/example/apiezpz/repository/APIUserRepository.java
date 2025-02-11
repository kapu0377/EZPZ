package com.example.apiezpz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.api01.domain.APIUser;

import java.util.Optional;

public interface APIUserRepository extends JpaRepository<APIUser, Long> {
    Optional<APIUser> findByUsername(String username);
}
