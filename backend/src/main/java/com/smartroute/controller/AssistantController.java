package com.smartroute.controller;

import com.smartroute.dto.CommandRequest;
import com.smartroute.dto.CommandResponse;
import com.smartroute.service.AssistantService;
import com.smartroute.service.NavigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
@CrossOrigin(origins = "*")
public class AssistantController {

    @Autowired
    private AssistantService assistantService;

    @Autowired
    private NavigationService navigationService;

    @PostMapping("/process")
    public ResponseEntity<CommandResponse> processCommand(@RequestBody CommandRequest request) {
        try {
            String response = assistantService.processCommand(request.getCommand(), request.getContext());
            return ResponseEntity.ok(new CommandResponse(response, "success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new CommandResponse("Sorry, I encountered an error: " + e.getMessage(), "error"));
        }
    }

    @PostMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "SmartRoute Buddy Assistant"
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "status", "active",
                "version", "1.0.0",
                "features", Map.of(
                        "voice_recognition", true,
                        "navigation", true,
                        "ai_integration", true,
                        "bluetooth_support", true,
                        "weather_integration", true,
                        "telugu_support", true
                )
        ));
    }
} 