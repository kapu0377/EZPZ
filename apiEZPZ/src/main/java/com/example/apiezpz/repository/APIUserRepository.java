package com.example.apiezpz.repository;

import com.example.apiezpz.domain.APIUser;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface APIUserRepository extends JpaRepository<APIUser, Long> {
    Optional<APIUser> findByUsername(String username);
}
