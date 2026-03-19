package com.example.demo.domain.insurance_plan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InsurancePlanResponse {
        private UUID id;
    private String name;
    private String type;
    private String description;
    private BigDecimal coverageAmount;
    private BigDecimal monthlyPremium;
    private Integer durationMonths;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
