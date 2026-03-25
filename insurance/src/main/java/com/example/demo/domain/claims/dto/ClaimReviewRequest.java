package com.example.demo.domain.claims.dto;

import lombok.Data;

@Data
public class ClaimReviewRequest {
    private String status;    // APPROVED or REJECTED
    private String adminNote;
}