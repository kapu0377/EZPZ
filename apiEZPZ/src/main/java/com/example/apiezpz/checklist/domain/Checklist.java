package com.example.apiezpz.checklist.domain;

import com.example.apiezpz.domain.APIUser;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)   //회원과 연결
    private APIUser member;

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories = new ArrayList<>();

    //Setter로 대체
//    public void changeTitle(String title) {
//        this.title = title;
//    }
//    public void changeDepartureDate(LocalDate departureDate) {
//        this.departureDate = departureDate;
//    }
//    public void changeReturnDate(LocalDate returnDate) {
//        this.returnDate = returnDate;
//    }
}
