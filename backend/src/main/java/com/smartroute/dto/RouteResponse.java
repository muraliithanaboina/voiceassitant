package com.smartroute.dto;

import java.util.List;
import java.util.Map;

public class RouteResponse {
    private Map<String, Object> route;
    private String error;
    private List<Map<String, Object>> steps;
    private String duration;
    private String distance;

    public RouteResponse() {}

    public RouteResponse(Map<String, Object> route, String error) {
        this.route = route;
        this.error = error;
    }

    public Map<String, Object> getRoute() {
        return route;
    }

    public void setRoute(Map<String, Object> route) {
        this.route = route;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public List<Map<String, Object>> getSteps() {
        return steps;
    }

    public void setSteps(List<Map<String, Object>> steps) {
        this.steps = steps;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getDistance() {
        return distance;
    }

    public void setDistance(String distance) {
        this.distance = distance;
    }
} 