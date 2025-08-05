package com.smartroute.controller;

import com.smartroute.dto.NavigationRequest;
import com.smartroute.dto.RouteResponse;
import com.smartroute.service.NavigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/navigation")
@CrossOrigin(origins = "*")
public class NavigationController {

    @Autowired
    private NavigationService navigationService;

    @PostMapping("/route")
    public ResponseEntity<RouteResponse> getRoute(@RequestBody NavigationRequest request) {
        try {
            RouteResponse route = navigationService.getRoute(request.getOrigin(), request.getDestination());
            return ResponseEntity.ok(route);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new RouteResponse(null, "Failed to get route: " + e.getMessage()));
        }
    }

    @PostMapping("/reroute")
    public ResponseEntity<RouteResponse> reroute(@RequestBody NavigationRequest request) {
        try {
            RouteResponse route = navigationService.reroute(request.getOrigin(), request.getDestination());
            return ResponseEntity.ok(route);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new RouteResponse(null, "Failed to reroute: " + e.getMessage()));
        }
    }

    @GetMapping("/geocode")
    public ResponseEntity<Map<String, Object>> geocode(@RequestParam String query) {
        try {
            Map<String, Object> places = navigationService.geocode(query);
            return ResponseEntity.ok(places);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to geocode: " + e.getMessage()));
        }
    }

    @GetMapping("/nearby")
    public ResponseEntity<Map<String, Object>> getNearbyPlaces(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "restaurant") String type,
            @RequestParam(defaultValue = "1000") int radius) {
        try {
            Map<String, Object> places = navigationService.getNearbyPlaces(lat, lng, type, radius);
            return ResponseEntity.ok(places);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get nearby places: " + e.getMessage()));
        }
    }

    @GetMapping("/current-location")
    public ResponseEntity<Map<String, Object>> getCurrentLocation() {
        // This would typically get the location from the frontend
        // For demo purposes, we'll return a mock location in Hyderabad
        return ResponseEntity.ok(Map.of(
                "lat", 17.3850,
                "lng", 78.4867,
                "accuracy", 10.0,
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "Navigation Service",
                "apis", Map.of(
                        "openroute", "connected",
                        "geocoding", "available",
                        "routing", "available"
                )
        ));
    }
} 