package org.zerock.ezpacking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class EzpackingApplication {
    public static void main(String[] args) {
        SpringApplication.run(EzpackingApplication.class, args);
    }
}