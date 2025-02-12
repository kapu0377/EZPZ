package com.example.apiezpz.repositoryTest;

import com.example.apiezpz.checklist.domain.Checklist;
import com.example.apiezpz.checklist.repository.ChecklistRepository;
import com.example.apiezpz.domain.APIUser;
import com.example.apiezpz.post.domain.Post;
import com.example.apiezpz.post.repository.PostRepository;
import com.example.apiezpz.repository.APIUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.stream.IntStream;


@SpringBootTest
@Transactional
public class ChecklistRepositoryTest {

    @Autowired
    private ChecklistRepository checklistRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private APIUserRepository apiUserRepository;

    @Test
    public void insertChecklist() {
        // 체크리스트 저장 (회원 없이)
        IntStream.rangeClosed(1,10).forEach(i -> {
            Checklist checklist = Checklist.builder()
                    .title("title"+i)
                    .departureDate(LocalDate.of(2025, 3, 1))
                    .returnDate(LocalDate.of(2025, 3, 10))
                    .build();
            checklistRepository.save(checklist);
        });
    }
    @Test
    public void insertPost() {
        Post post = new Post();
        post.setTitle("title");
        post.setWriter("writer");
        post.setContent("content");
        postRepository.save(post);
    }
    @Test
    public void insertUser() {
        APIUser user = APIUser.builder()
                .username("username")
                .password("asd")
                .build();
        apiUserRepository.save(user);
    }

}
