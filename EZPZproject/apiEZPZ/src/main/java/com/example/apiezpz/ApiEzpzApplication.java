package com.example.apiezpz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ApiEzpzApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiEzpzApplication.class, args);
    }

}
