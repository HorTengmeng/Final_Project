package com.example.demo.domain.payment.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.config.FileStorageService;
import com.example.demo.domain.auth.model.User;
import com.example.demo.domain.payment.dto.PaymentConfirmRequest;
import com.example.demo.domain.payment.dto.PaymentRequest;
import com.example.demo.domain.payment.dto.PaymentResponse;
import com.example.demo.domain.payment.repository.PaymentRepository;
import com.example.demo.domain.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final FileStorageService fileStorageService;
    private final PaymentRepository paymentRepository;

    // USER makes payment
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<PaymentResponse> makePayment(
            @AuthenticationPrincipal User currentUser,
            @ModelAttribute PaymentRequest request) {

        // Handle file upload
        if (request.getReceipt() != null && !request.getReceipt().isEmpty()) {
            String receiptUrl = fileStorageService.storeFile(
                    request.getReceipt(), "payments"); // ← store in payments folder
            System.out.println("Receipt URL: " + receiptUrl); // ← add this
            request.setReceiptUrl(receiptUrl); // ← set URL in request
        }

        return ResponseEntity.ok(
                paymentService.makePayment(currentUser.getId(), request));
    }

    // USER views own payments
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                paymentService.getMyPayments(currentUser.getId()));
    }

    // ADMIN views all payments
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // ADMIN filters by status
    @GetMapping("/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(
                paymentService.getPaymentsByStatus(status));
    }

    // ADMIN confirms payment
    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @PathVariable UUID id,
            @RequestBody PaymentConfirmRequest request) {
        return ResponseEntity.ok(
                paymentService.confirmPayment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, String>> deletePayment(
            @PathVariable UUID id) {
        paymentRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Payment deleted successfully");
        return ResponseEntity.ok(response);
    }
}
