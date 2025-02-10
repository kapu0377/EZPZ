package org.zerock.ezpacking.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "search_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SearchHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String keyword;

    @Column(nullable = false)
    private Long count;

    @Column(nullable = false)
    private boolean carryOnAllowed;

    @Column(nullable = false)
    private boolean checkedAllowed;

    @Column(length = 500)
    private String restrictions;

    public void incrementCount() {
        this.count++;
    }

    public void updateLastSearchResult(boolean carryOnAllowed, boolean checkedAllowed, String restrictions) {
        this.carryOnAllowed = carryOnAllowed;
        this.checkedAllowed = checkedAllowed;
        this.restrictions = restrictions;
    }
}