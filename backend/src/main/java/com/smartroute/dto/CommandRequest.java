package com.smartroute.dto;

import java.util.Map;

public class CommandRequest {
    private String command;
    private Map<String, Object> location;
    private Map<String, Object> context;

    public CommandRequest() {}

    public CommandRequest(String command, Map<String, Object> location, Map<String, Object> context) {
        this.command = command;
        this.location = location;
        this.context = context;
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public Map<String, Object> getLocation() {
        return location;
    }

    public void setLocation(Map<String, Object> location) {
        this.location = location;
    }

    public Map<String, Object> getContext() {
        return context;
    }

    public void setContext(Map<String, Object> context) {
        this.context = context;
    }
} 