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

    // Airport 엔티티를 DTO로 변환하는 정적 메서드
    public static AirportDTO fromEntity(Airport airport) {
        return new AirportDTO(
                airport.getId(),
                airport.getName(),
                airport.getCode()
        );
    }

    // DTO를 Airport 엔티티로 변환하는 메서드
    public Airport toEntity() {
        Airport airport = new Airport();
        airport.setName(this.name);
        airport.setCode(this.code);
        return airport;
    }
}
