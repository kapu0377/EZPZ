package com.example.apiezpz.rating.dto;

import com.example.apiezpz.rating.domain.Airport;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AirportDTO {
    private Long id;
    private String name;
    private String code;
}
