package com.example.apiezpz.objectdetection.controller;

import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
public class ObjectDetectionController {
  @PostMapping("/api/odimg")
  public List<AnnotateImageResponse> objectDetection(@RequestParam("file") MultipartFile file) {
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
        return responses;
//        System.out.println("-------RESPONSE------------------------------------------------------------------------");
//        System.out.println(response);
//        System.out.println("=======RESPONSES================================================================");
//        System.out.println(responses);
        // Display the results
//        for (AnnotateImageResponse res : responses) {
//          for (LocalizedObjectAnnotation entity : res.getLocalizedObjectAnnotationsList()) {
//            System.out.format("Object name: %s%n", entity.getName());
//            System.out.format("Confidence: %s%n", entity.getScore());
//            System.out.format("Normalized Vertices:%n");
//            entity
//                .getBoundingPoly()
//                .getNormalizedVerticesList()
//                .forEach(vertex -> System.out.format("- (%s, %s)%n", vertex.getX(), vertex.getY()));
//          }
//        }
      }
    }catch (Exception e){
      e.printStackTrace();
      return null;
    }
  }
}
