package com.example.apiezpz.repositoryTest;

import com.example.apiezpz.checklist.domain.Category;
import com.example.apiezpz.checklist.domain.Checklist;
import com.example.apiezpz.checklist.domain.Item;
import com.example.apiezpz.checklist.repository.CategoryRepository;
import com.example.apiezpz.checklist.repository.ChecklistRepository;
import com.example.apiezpz.checklist.repository.ItemRepository;
import com.example.apiezpz.domain.APIUser;
import com.example.apiezpz.repository.APIUserRepository;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.time.LocalDate;
import java.util.stream.IntStream;

import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Log4j2
public class ChecklistRepositoryTest {

    @Autowired
    private ChecklistRepository checklistRepository;
    @Autowired
    private APIUserRepository apiUserRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ItemRepository itemRepository;

    @Test
    public void insertChecklist() {
        // 특정 회원 가져오기
        APIUser member1 = apiUserRepository.findById(1L).orElseThrow(() -> new RuntimeException("회원 없음"));

        IntStream.rangeClosed(11,20).forEach(i -> {
            Checklist checklist = Checklist.builder()
                    .title("title"+i)
                    .departureDate(LocalDate.of(2025, 3, 1))
                    .returnDate(LocalDate.of(2025, 3, 10))
                    .member(member1)
                    .build();
            checklistRepository.save(checklist);
        });
    }
    @Test
    public void insertCategory() {
        // 특정 checklist 가져오기
        Checklist checklist = checklistRepository.findById(88L).orElseThrow(() -> new RuntimeException("체크리스트 없음"));

        IntStream.rangeClosed(1,10).forEach(i -> {
            Category category = Category.builder()
                    .name("category"+i)
                    .checklist(checklist)
                    .build();
            categoryRepository.save(category);
        });
    }
    @Test
    public void insertItem() {
        //특정 카테고리 가져오기
        Category category = categoryRepository.findById(21L).orElseThrow(() -> new RuntimeException("아이템 없음"));

        IntStream.rangeClosed(1,10).forEach(i -> {
            Item item = Item.builder()
                    .name("item"+i)
                    .checked(false)
                    .category(category)
                    .build();
            itemRepository.save(item);
        });
    }
    @Test
    public void deleteItem() {
        // 특정 아이템 가져오기(제일 첫 행)
        Item item = itemRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("삭제할 아이템이 없습니다. 먼저 insertItem() 실행하세요."));
        log.info("삭제할 아이템 ID: " + item.getId());
        // 아이템 삭제
        itemRepository.delete(item);
        log.info("아이템 삭제 완료.");
    }
    @Test
    public void deleteCategory() {
        // 특정 카테고리 가져오기
        Category category = categoryRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("삭제할 카테고리가 없습니다. 먼저 insertCategory() 실행하세요."));
        log.info("삭제할 카테고리 ID: " + category.getId());
        // 카테고리 삭제 (연관된 아이템도 삭제되는지 확인)
        categoryRepository.delete(category);
        log.info("카테고리 삭제 완료.");
    }

    @Test
    public void deleteChecklist() {
        // 특정 체크리스트 가져오기
        Checklist checklist = checklistRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("삭제할 체크리스트가 없습니다. 먼저 insertChecklist() 실행하세요."));
        log.info("삭제할 체크리스트 ID: " + checklist.getId());
        // 체크리스트 삭제 (연관된 카테고리 및 아이템도 삭제되는지 확인)
        checklistRepository.delete(checklist);
        log.info("체크리스트 삭제 완료.");
    }
    @Test
//    @Transactional // 트랜잭션 적용 (테스트 종료 후 자동 롤백되지 않도록 설정 가능)
    public void testFindByCategoryIdOrderByNameAsc() {
        // 실제 DB에서 카테고리를 생성 및 저장
        Category category = Category.builder()
                .name("여행 준비물")
                .build();
        category = categoryRepository.save(category); // DB에 저장 후 다시 가져오기

        // 해당 카테고리에 아이템 추가 (랜덤 순서)
        Item item1 = Item.builder().name("여권").category(category).checked(false).build();
        Item item2 = Item.builder().name("충전기").category(category).checked(false).build();
        Item item3 = Item.builder().name("선글라스").category(category).checked(false).build();
        Item item4 = Item.builder().name("의류").category(category).checked(false).build();

        itemRepository.save(item1);
        itemRepository.save(item2);
        itemRepository.save(item3);
        itemRepository.save(item4);

        // 실제 DB에서 아이템을 이름순으로 정렬하여 조회
        List<Item> sortedItems = itemRepository.findByCategoryIdOrderByNameAsc(category.getId());

        // 4️⃣ 정렬 결과 검증
        assertThat(sortedItems).isNotNull();
        assertThat(sortedItems.size()).isEqualTo(4);
        assertThat(sortedItems.get(0).getName()).isEqualTo("선글라스");
        assertThat(sortedItems.get(1).getName()).isEqualTo("여권");
        assertThat(sortedItems.get(2).getName()).isEqualTo("의류");
        assertThat(sortedItems.get(3).getName()).isEqualTo("충전기");

        // 5️⃣ 로그 출력 (테스트 실행 후 실제 DB에서 확인 가능)
        log.info("✔ 실제 DB에서 정렬된 아이템 목록:");
        sortedItems.forEach(item -> log.info(item.getName()));
    }
}
