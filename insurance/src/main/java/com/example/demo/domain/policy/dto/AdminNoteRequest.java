package com.example.demo.domain.policy.dto;
import lombok.Data;

@Data
public class AdminNoteRequest {
    private String adminNote;
    private String status; // ACTIVE or CANCELLED
}
