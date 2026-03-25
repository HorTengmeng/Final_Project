package com.example.demo.domain.claims.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.example.demo.domain.claims.model.ClaimStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClaimResponse {
    private UUID id;
    private UUID policyId;
    private String planName;
    private String userFullName;
    private String reason;
    private BigDecimal amountRequested;
    private ClaimStatus status;
    private String adminNote;
    private LocalDateTime createdAt;
}
