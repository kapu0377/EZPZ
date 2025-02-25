package com.example.apiezpz.objectdetection.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ObjectDetectionDTO {
  private String name;
  private double score;
  private List<Vertex> vertexList;

  @Data
  public static class Vertex{
    private double x;
    private double y;
  }
}
