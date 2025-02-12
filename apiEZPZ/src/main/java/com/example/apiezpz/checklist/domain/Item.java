package com.example.apiezpz.checklist.domain;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "items")
@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "category") //순환 참조 방지를 위해 연관 엔터티 필드는 제외
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private boolean checked;    //체크여부

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
}
