package org.zerock.api01.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class APIUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String username;
  private String password;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
  private List<Checklist> checklists;
}
