package com.example.apiezpz.prohibited.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "detection")
public class Detection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String airportName; // 공항명 (청주공항 등)

    private String category; // 적발된 물품 유형 (날카로운 물체, 공구류 등)

    private int detectionCount; // 적발 건수
}
