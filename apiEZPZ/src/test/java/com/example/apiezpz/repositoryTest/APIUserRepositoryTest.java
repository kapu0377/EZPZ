package com.example.apiezpz.repositoryTest;

import com.example.apiezpz.domain.APIUser;
import com.example.apiezpz.repository.APIUserRepository;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.stream.IntStream;

@SpringBootTest
@Log4j2
public class APIUserRepositoryTest {
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private APIUserRepository apiUserRepository;
    @Test
    public void testInsert() {
        IntStream.rangeClosed(1,100).forEach(i -> {
            APIUser apiUser = APIUser.builder()
                    .username("member" + i)
                    .password(passwordEncoder.encode("1111"))
                    .build();
            apiUserRepository.save(apiUser);
        });
    }
    @Test
    public void deleteMember() {
        // 특정 회원 가져오기
        APIUser apiUser = apiUserRepository.findById(1L).orElseThrow(()->new RuntimeException("해당 회원 번호 없음"));
        log.info("삭제할 멤버 ID: " + apiUser.getId());
        // 체크리스트 삭제 (연관된 카테고리 및 아이템도 삭제되는지 확인)
        apiUserRepository.delete(apiUser);
        log.info("회원 삭제 완료.");
    }
}
