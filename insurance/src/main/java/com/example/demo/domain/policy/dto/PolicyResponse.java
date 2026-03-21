package com.example.demo.domain.policy.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.example.demo.domain.policy.model.PolicyStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PolicyResponse {
    private UUID id;
    private UUID userId;
    private String userFullName;
    private UUID planId;
    private String planName;
    private String planType;
    private PolicyStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String adminNote;
    private LocalDateTime createdAt;
}