package com.example.demo.domain.insurance_plan.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class InsurancePlanRequest {
     private String name;
    private String type;
    private String description;
    private BigDecimal coverageAmount;
    private BigDecimal monthlyPremium;
    private Integer durationMonths;
}
