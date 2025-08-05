package com.smartroute.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        return ResponseEntity.ok(Map.of(
                "message", "pong",
                "timestamp", System.currentTimeMillis(),
                "status", "success"
        ));
    }

    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echo(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of(
                "message", "echo",
                "data", request,
                "timestamp", System.currentTimeMillis(),
                "status", "success"
        ));
    }
} 