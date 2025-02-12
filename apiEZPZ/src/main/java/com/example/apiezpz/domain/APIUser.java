package com.example.apiezpz.domain;

import com.example.apiezpz.checklist.domain.Checklist;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "checklists") // 순환 참조 방지
@Table(name = "members")  //테이블명을 members로 명시
public class APIUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String username;
  private String password;

  //한명의 회원이 여러개의 체크리스트 관리
  @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Checklist> checklists = new ArrayList<>();

}
