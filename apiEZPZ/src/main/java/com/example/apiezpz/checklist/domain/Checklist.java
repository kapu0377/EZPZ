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
//@ToString(exclude = {"member", "categories"})
@ToString(exclude = "categories")
public class Checklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private LocalDate departureDate;    //출발일
    private LocalDate returnDate;   //도착일

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "member_id")
//    private Member member;

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories = new ArrayList<>();
}
