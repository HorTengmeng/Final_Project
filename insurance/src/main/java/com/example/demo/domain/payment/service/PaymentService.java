package com.example.demo.domain.payment.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.domain.payment.dto.PaymentConfirmRequest;
import com.example.demo.domain.payment.dto.PaymentRequest;
import com.example.demo.domain.payment.dto.PaymentResponse;

public interface PaymentService {

    // USER makes payment
    PaymentResponse makePayment(UUID userId, PaymentRequest request);

    // USER views own payments
    List<PaymentResponse> getMyPayments(UUID userId);

    // ADMIN views all payments
    List<PaymentResponse> getAllPayments();

    // ADMIN views payments by status
    List<PaymentResponse> getPaymentsByStatus(String status);

    // ADMIN confirms payment
    PaymentResponse confirmPayment(UUID paymentId, PaymentConfirmRequest request);
}
