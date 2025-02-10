package org.zerock.api01.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "checklists")
@Getter
@Setter
public class Checklist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;
    private String item;
    private Boolean isChecked = false;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private APIUser user;

    public void setUser(APIUser user) {
    }
}
