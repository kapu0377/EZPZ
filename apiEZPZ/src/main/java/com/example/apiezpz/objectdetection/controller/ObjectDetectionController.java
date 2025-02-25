package com.example.apiezpz.objectdetection.controller;

import com.example.apiezpz.objectdetection.dto.ObjectDetectionDTO;
import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

// Google Vision API를 사용한 이미지 객체 탐지
@RestController
public class ObjectDetectionController {
  @PostMapping("/api/odimg")
  public List<ObjectDetectionDTO> objectDetection(@RequestParam("file") MultipartFile file) {
    try{
      if(file.isEmpty()){
//        return "Image is empty";
        return null;
      }
      List<AnnotateImageRequest> requests = new ArrayList<>();

      ByteString imgBytes = ByteString.readFrom(file.getInputStream());

      Image img = Image.newBuilder().setContent(imgBytes).build();
      AnnotateImageRequest request =
          AnnotateImageRequest.newBuilder()
              .addFeatures(Feature.newBuilder().setType(Feature.Type.OBJECT_LOCALIZATION))
              .setImage(img)
              .build();
      requests.add(request);

      // Initialize client that will be used to send requests. This client only needs to be created
      // once, and can be reused for multiple requests. After completing all of your requests, call
      // the "close" method on the client to safely clean up any remaining background resources.
      try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
        // Perform the request
        BatchAnnotateImagesResponse response = client.batchAnnotateImages(requests);
        List<AnnotateImageResponse> responses = response.getResponsesList();
        return responses.get(0).getLocalizedObjectAnnotationsList().stream()
            .map(entity -> {
              ObjectDetectionDTO objResponse = new ObjectDetectionDTO();
              objResponse.setName(entity.getName());
              objResponse.setScore(entity.getScore());
              objResponse.setVertexList(entity.getBoundingPoly().getNormalizedVerticesList().stream()
                  .map(vertex -> {
                    ObjectDetectionDTO.Vertex v = new ObjectDetectionDTO.Vertex();
                    v.setX(vertex.getX());
                    v.setY(vertex.getY());
                    return v;
                  })
                  .collect(Collectors.toList()));
              return objResponse;
            })
            .collect(Collectors.toList());
      }
    }catch (Exception e){
      e.printStackTrace();
      return null;
    }
  }
}
