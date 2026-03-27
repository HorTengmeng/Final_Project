package com.example.demo.domain.payment.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.example.demo.domain.payment.model.PaymentStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private UUID id;
    private UUID policyId;
    private String planName;
    private String userFullName;
    private BigDecimal amount;
    private String monthYear;
    private LocalDate paymentDate;
    private PaymentStatus status;
    private String receiptUrl;
    private String adminNote;
    private LocalDateTime createdAt;
}
