package com.smartroute.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class AssistantService {

    @Value("${ollama.base-url}")
    private String ollamaBaseUrl;

    @Value("${ollama.model}")
    private String model;

    @Value("${ollama.temperature}")
    private double temperature;

    @Value("${ollama.max-tokens}")
    private int maxTokens;

    @Value("${openweather.api-key:}")
    private String openWeatherApiKey;

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String processCommand(String command, Map<String, Object> context) throws IOException {
        // Check for specific command patterns
        String lowerCommand = command.toLowerCase();

        // Navigation commands
        if (lowerCommand.contains("take me to") || lowerCommand.contains("navigate to")) {
            return handleNavigationCommand(command);
        }

        // Stop commands
        if (lowerCommand.contains("stop") || lowerCommand.contains("cancel")) {
            return "Stopped. How else can I help you?";
        }

        // Time commands
        if (lowerCommand.contains("time") || lowerCommand.contains("what time")) {
            return "The current time is " + java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
        }

        // Weather commands
        if (lowerCommand.contains("weather")) {
            return handleWeatherCommand(command, context);
        }

        // Telugu commands
        if (lowerCommand.contains("ఎక్కడికి") || lowerCommand.contains("మార్గం")) {
            return handleTeluguCommand(command);
        }

        // General questions - use Ollama
        return processWithOllama(command, context);
    }

    private String handleNavigationCommand(String command) {
        String destination = command.replaceAll("(?i)(take me to|navigate to)", "").trim();
        return "I'll help you navigate to " + destination + ". Let me get the route for you.";
    }

    private String handleWeatherCommand(String command, Map<String, Object> context) {
        try {
            // Get location from context or use default
            Map<String, Object> location = (Map<String, Object>) context.get("location");
            double lat = 17.3850; // Default to Hyderabad
            double lng = 78.4867;
            
            if (location != null && location.containsKey("lat") && location.containsKey("lng")) {
                lat = (Double) location.get("lat");
                lng = (Double) location.get("lng");
            }

            // Call OpenWeatherMap API
            String weatherInfo = getWeatherData(lat, lng);
            return weatherInfo;
        } catch (Exception e) {
            return "I'm sorry, I couldn't get the weather information right now. You can check your local weather app for current conditions.";
        }
    }

    private String getWeatherData(double lat, double lng) throws IOException {
        if (openWeatherApiKey == null || openWeatherApiKey.isEmpty()) {
            return "Weather service is not configured. Please set up OpenWeatherMap API key.";
        }

        String url = String.format(
                "https://api.openweathermap.org/data/2.5/weather?lat=%f&lon=%f&appid=%s&units=metric",
                lat, lng, openWeatherApiKey
        );

        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Weather API request failed: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);

            if (jsonResponse.has("main") && jsonResponse.has("weather")) {
                JsonNode main = jsonResponse.get("main");
                JsonNode weather = jsonResponse.get("weather").get(0);
                
                double temp = main.get("temp").asDouble();
                int humidity = main.get("humidity").asInt();
                String description = weather.get("description").asText();
                String city = jsonResponse.get("name").asText();

                return String.format("Current weather in %s: %s, %.1f°C, %d%% humidity", 
                        city, description, temp, humidity);
            } else {
                return "Weather information is currently unavailable.";
            }
        }
    }

    private String handleTeluguCommand(String command) {
        // Handle Telugu navigation commands
        if (command.contains("ఎక్కడికి")) {
            return "మీరు ఎక్కడికి వెళ్లాలనుకుంటున్నారు? (Where do you want to go?)";
        }
        if (command.contains("మార్గం")) {
            return "మీకు మార్గం చూపిస్తాను. (I'll show you the route.)";
        }
        return "నేను మీకు సహాయం చేయగలను. (I can help you.)";
    }

    private String processWithOllama(String command, Map<String, Object> context) throws IOException {
        String prompt = buildPrompt(command, context);

        String requestBody = objectMapper.writeValueAsString(Map.of(
                "model", model,
                "prompt", prompt,
                "stream", false,
                "options", Map.of(
                        "temperature", temperature,
                        "num_predict", maxTokens
                )
        ));

        Request request = new Request.Builder()
                .url(ollamaBaseUrl + "/api/generate")
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(requestBody, MediaType.get("application/json")))
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Ollama API request failed: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            
            return jsonResponse.get("response").asText();
        }
    }

    private String buildPrompt(String command, Map<String, Object> context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are SmartRoute Buddy, a helpful voice assistant with Telugu language support. ");
        prompt.append("Provide concise, friendly responses suitable for voice output. Keep responses under 100 words.\n\n");
        prompt.append("User command: ").append(command).append("\n");
        
        if (context != null && !context.isEmpty()) {
            prompt.append("Context: ").append(context.toString()).append("\n");
        }
        
        prompt.append("Please provide a helpful, concise response suitable for voice output.");
        
        return prompt.toString();
    }

    // Telugu language support methods
    public String translateToTelugu(String englishText) {
        // Simple English to Telugu translation mapping
        Map<String, String> translations = Map.of(
                "take left", "ఎడమవైపు తీసుకో",
                "take right", "కుడివైపు తీసుకో",
                "go straight", "ముందుకు వెళ్లు",
                "stop", "నిలిపి వేయి",
                "turn around", "తిరిగి వెళ్లు",
                "destination reached", "గమ్యం చేరుకున్నారు",
                "wrong turn", "తప్పు మలుపు",
                "recalculating route", "మార్గం తిరిగి లెక్కిస్తున్నాను"
        );

        String lowerText = englishText.toLowerCase();
        for (Map.Entry<String, String> entry : translations.entrySet()) {
            if (lowerText.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return englishText;
    }

    public String translateFromTelugu(String teluguText) {
        // Simple Telugu to English translation mapping
        Map<String, String> translations = Map.of(
                "ఎడమవైపు తీసుకో", "take left",
                "కుడివైపు తీసుకో", "take right",
                "ముందుకు వెళ్లు", "go straight",
                "నిలిపి వేయి", "stop",
                "తిరిగి వెళ్లు", "turn around",
                "గమ్యం చేరుకున్నారు", "destination reached",
                "తప్పు మలుపు", "wrong turn",
                "మార్గం తిరిగి లెక్కిస్తున్నాను", "recalculating route"
        );

        String lowerText = teluguText.toLowerCase();
        for (Map.Entry<String, String> entry : translations.entrySet()) {
            if (lowerText.contains(entry.getKey().toLowerCase())) {
                return entry.getValue();
            }
        }
        return teluguText;
    }
} 