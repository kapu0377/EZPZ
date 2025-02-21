package com.example.apiezpz.rating.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "ratings")
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "airport_id", nullable = false)
    private Airport airport;
    @Column(name = "airport_code", nullable = false)
    private String airportCode;

    @Column(nullable = false)
    private Integer satisfaction;
    @Column(nullable = false)
    private Integer cleanliness;
    @Column(nullable = false)
    private Integer convenience;

    @PrePersist
    public void prePersist() {
        if (this.airport != null) {
            this.airportCode = this.airport.getCode();
        }
    }
}
