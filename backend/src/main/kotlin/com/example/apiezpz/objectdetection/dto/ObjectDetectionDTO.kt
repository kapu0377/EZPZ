package com.example.apiezpz.objectdetection.dto

data class ObjectDetectionDTO(
    var name: String = "",
    var score: Double = 0.0,
    var vertexList: List<Vertex> = emptyList()
) {
    data class Vertex(
        var x: Double = 0.0,
        var y: Double = 0.0
    )
} 