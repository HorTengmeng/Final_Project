package com.example.demo.domain.claims.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Data;

@Data
public class ClaimRequest {
    private UUID policyId;
    private String reason;
    private BigDecimal amountRequested;
}
