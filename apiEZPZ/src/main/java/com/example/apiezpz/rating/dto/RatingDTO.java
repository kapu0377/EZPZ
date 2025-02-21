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
}