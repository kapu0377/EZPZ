package com.example.apiezpz.checklist.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "checklists")
@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "categories")
public class Checklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private LocalDate departureDate;    //출발일
    private LocalDate returnDate;   //도착일

    @Column(nullable = false)
    private String username; // 로그인한 사용자의 username 저장

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories = new ArrayList<>();


}
