package com.example.apiezpz.checklist.domain;

import lombok.*;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"checklist", "checklistItems"})
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id")
    private Checklist checklist;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChecklistItem> checklistItems = new ArrayList<>();

    // 아이템 추가 편의 메서드
    public void addItem(ChecklistItem checklistItem) {
        checklistItems.add(checklistItem);
        checklistItem.setCategory(this);
    }

    // 아이템 삭제 편의 메서드
    public void removeItem(ChecklistItem checklistItem) {
        checklistItems.remove(checklistItem);
        checklistItem.setCategory(null);
    }
}