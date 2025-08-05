package com.smartroute.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartroute.dto.RouteResponse;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class NavigationService {

    @Value("${openroute.api-key}")
    private String openRouteApiKey;

    @Value("${openroute.base-url}")
    private String baseUrl;

    @Value("${openroute.geocoding-url}")
    private String geocodingUrl;

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public RouteResponse getRoute(Map<String, Object> origin, Map<String, Object> destination) throws IOException {
        String originStr = formatLocation(origin);
        String destinationStr = formatLocation(destination);

        // OpenRouteService API request
        String requestBody = objectMapper.writeValueAsString(Map.of(
                "coordinates", List.of(
                        List.of(Double.parseDouble(originStr.split(",")[1]), Double.parseDouble(originStr.split(",")[0])),
                        List.of(Double.parseDouble(destinationStr.split(",")[1]), Double.parseDouble(destinationStr.split(",")[0]))
                ),
                "profile", "driving-car",
                "format", "geojson"
        ));

        Request request = new Request.Builder()
                .url(baseUrl + "/directions/driving-car/geojson")
                .addHeader("Authorization", openRouteApiKey)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(requestBody, MediaType.get("application/json")))
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("OpenRouteService API request failed: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);

            if (jsonResponse.has("features") && jsonResponse.get("features").size() > 0) {
                return parseOpenRouteResponse(jsonResponse);
            } else {
                return new RouteResponse(null, "Failed to get route: No route found");
            }
        }
    }

    public RouteResponse reroute(Map<String, Object> origin, Map<String, Object> destination) throws IOException {
        String originStr = formatLocation(origin);
        String destinationStr = formatLocation(destination);

        // OpenRouteService API request with different profile
        String requestBody = objectMapper.writeValueAsString(Map.of(
                "coordinates", List.of(
                        List.of(Double.parseDouble(originStr.split(",")[1]), Double.parseDouble(originStr.split(",")[0])),
                        List.of(Double.parseDouble(destinationStr.split(",")[1]), Double.parseDouble(destinationStr.split(",")[0]))
                ),
                "profile", "driving-car",
                "format", "geojson",
                "preference", "fastest"
        ));

        Request request = new Request.Builder()
                .url(baseUrl + "/directions/driving-car/geojson")
                .addHeader("Authorization", openRouteApiKey)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(requestBody, MediaType.get("application/json")))
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("OpenRouteService API request failed: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);

            if (jsonResponse.has("features") && jsonResponse.get("features").size() > 0) {
                RouteResponse routeResponse = parseOpenRouteResponse(jsonResponse);
                routeResponse.setError("Route recalculated due to traffic or road conditions.");
                return routeResponse;
            } else {
                return new RouteResponse(null, "Failed to reroute: No route found");
            }
        }
    }

    public Map<String, Object> geocode(String query) throws IOException {
        String url = String.format("%s?api_key=%s&text=%s&size=5", 
                geocodingUrl, openRouteApiKey, query);

        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Geocoding API request failed: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);

            Map<String, Object> result = new HashMap<>();
            List<Map<String, Object>> places = new ArrayList<>();

            if (jsonResponse.has("features")) {
                JsonNode features = jsonResponse.get("features");
                for (JsonNode feature : features) {
                    Map<String, Object> placeInfo = new HashMap<>();
                    placeInfo.put("name", feature.get("properties").get("name").asText());
                    placeInfo.put("address", feature.get("properties").get("formatted").asText());
                    
                    JsonNode coordinates = feature.get("geometry").get("coordinates");
                    placeInfo.put("lng", coordinates.get(0).asDouble());
                    placeInfo.put("lat", coordinates.get(1).asDouble());
                    
                    places.add(placeInfo);
                }
            }

            result.put("places", places);
            result.put("status", "OK");
            return result;
        }
    }

    public Map<String, Object> getNearbyPlaces(double lat, double lng, String type, int radius) throws IOException {
        // Use OpenRouteService geocoding for nearby places
        String query = String.format("%s near %f,%f", type, lat, lng);
        return geocode(query);
    }

    private String formatLocation(Map<String, Object> location) {
        if (location == null) {
            return "";
        }
        
        if (location.containsKey("lat") && location.containsKey("lng")) {
            return location.get("lat") + "," + location.get("lng");
        } else if (location.containsKey("address")) {
            return location.get("address").toString();
        }
        
        return "";
    }

    private RouteResponse parseOpenRouteResponse(JsonNode jsonResponse) {
        JsonNode feature = jsonResponse.get("features").get(0);
        JsonNode properties = feature.get("properties");
        JsonNode geometry = feature.get("geometry");

        RouteResponse routeResponse = new RouteResponse();
        
        // Extract duration and distance
        if (properties.has("summary")) {
            JsonNode summary = properties.get("summary");
            routeResponse.setDuration(formatDuration(summary.get("duration").asDouble()));
            routeResponse.setDistance(formatDistance(summary.get("distance").asDouble()));
        }

        // Extract route coordinates
        List<Map<String, Object>> coordinates = new ArrayList<>();
        if (geometry.has("coordinates")) {
            JsonNode coords = geometry.get("coordinates");
            for (JsonNode coord : coords) {
                Map<String, Object> point = new HashMap<>();
                point.put("lng", coord.get(0).asDouble());
                point.put("lat", coord.get(1).asDouble());
                coordinates.add(point);
            }
        }
        routeResponse.setSteps(coordinates);

        // Extract route steps
        List<Map<String, Object>> steps = new ArrayList<>();
        if (properties.has("segments")) {
            JsonNode segments = properties.get("segments");
            for (JsonNode segment : segments) {
                if (segment.has("steps")) {
                    JsonNode segmentSteps = segment.get("steps");
                    for (JsonNode step : segmentSteps) {
                        Map<String, Object> stepInfo = new HashMap<>();
                        stepInfo.put("instruction", step.get("instruction").asText());
                        stepInfo.put("distance", formatDistance(step.get("distance").asDouble()));
                        stepInfo.put("duration", formatDuration(step.get("duration").asDouble()));
                        steps.add(stepInfo);
                    }
                }
            }
        }
        routeResponse.setSteps(steps);

        Map<String, Object> routeData = new HashMap<>();
        routeData.put("summary", "Route via OpenRouteService");
        routeResponse.setRoute(routeData);

        return routeResponse;
    }

    private String formatDuration(double seconds) {
        int hours = (int) (seconds / 3600);
        int minutes = (int) ((seconds % 3600) / 60);
        
        if (hours > 0) {
            return String.format("%d hr %d min", hours, minutes);
        } else {
            return String.format("%d min", minutes);
        }
    }

    private String formatDistance(double meters) {
        if (meters >= 1000) {
            return String.format("%.1f km", meters / 1000);
        } else {
            return String.format("%.0f m", meters);
        }
    }
} 