package com.example.demo.domain.payment.dto;
import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class PaymentRequest {
    private UUID policyId;
    private BigDecimal amount;
    private String monthYear;
    private MultipartFile receipt; 
    private String receiptUrl;      
}
