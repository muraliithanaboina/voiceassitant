package com.smartroute.dto;

import java.util.Map;

public class NavigationRequest {
    private Map<String, Object> origin;
    private Map<String, Object> destination;
    private String travelMode;

    public NavigationRequest() {}

    public NavigationRequest(Map<String, Object> origin, Map<String, Object> destination) {
        this.origin = origin;
        this.destination = destination;
        this.travelMode = "driving";
    }

    public Map<String, Object> getOrigin() {
        return origin;
    }

    public void setOrigin(Map<String, Object> origin) {
        this.origin = origin;
    }

    public Map<String, Object> getDestination() {
        return destination;
    }

    public void setDestination(Map<String, Object> destination) {
        this.destination = destination;
    }

    public String getTravelMode() {
        return travelMode;
    }

    public void setTravelMode(String travelMode) {
        this.travelMode = travelMode;
    }
} 