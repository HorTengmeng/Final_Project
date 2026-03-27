package com.example.demo.domain.payment.dto;
import lombok.Data;

@Data
public class PaymentConfirmRequest {
    private String status;      // PAID or FAILED
    private String adminNote;
}
