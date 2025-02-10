package org.zerock.ezpacking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.zerock.ezpacking.domain.entity.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByMid(String mid);
    boolean existsByUsername(String username);
    boolean existsByMid(String mid);
}