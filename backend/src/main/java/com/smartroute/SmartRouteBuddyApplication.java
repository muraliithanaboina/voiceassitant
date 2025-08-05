package com.smartroute;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SmartRouteBuddyApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartRouteBuddyApplication.class, args);
    }

} 