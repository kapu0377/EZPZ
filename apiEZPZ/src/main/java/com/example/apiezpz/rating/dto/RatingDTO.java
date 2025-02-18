package com.example.apiezpz.rating.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RatingDTO {
    private Integer satisfaction;
    private Integer cleanliness;
    private Integer convenience;
    private String comment;

    // 유효성 검사를 위한 메서드
    public boolean isValid() {
        return satisfaction != null && satisfaction >= 1 && satisfaction <= 10
                && cleanliness != null && cleanliness >= 1 && cleanliness <= 10
                && convenience != null && convenience >= 1 && convenience <= 10;
    }
}