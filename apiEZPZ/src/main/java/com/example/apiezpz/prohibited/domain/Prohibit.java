package com.example.apiezpz.prohibited.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "prohibit")
public class Prohibit {

    @Column(name = "GUBUN")
    private String gubun;
    @Column(name = "CARRY_BAN")
    private String carryBan;
    @Column(name = "CABIN")
    private String cabin;
    @Column(name = "TRUST")
    private String trust;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SEQ")
    private Long seq;


}

