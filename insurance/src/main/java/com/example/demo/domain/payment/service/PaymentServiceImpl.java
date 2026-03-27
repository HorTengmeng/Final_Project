package com.example.demo.domain.payment.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.domain.payment.dto.PaymentConfirmRequest;
import com.example.demo.domain.payment.dto.PaymentRequest;
import com.example.demo.domain.payment.dto.PaymentResponse;
import com.example.demo.domain.payment.model.Payment;
import com.example.demo.domain.payment.model.PaymentStatus;
import com.example.demo.domain.payment.repository.PaymentRepository;
import com.example.demo.domain.policy.model.Policy;
import com.example.demo.domain.policy.model.PolicyStatus;
import com.example.demo.domain.policy.repository.PolicyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PolicyRepository policyRepository;

    // Define where to save the files (make sure this folder exists on your PC)
    private final String UPLOAD_DIR = "uploads/receipts/";

    @Override
    public PaymentResponse makePayment(UUID userId, PaymentRequest request) {

        // 1. Find policy
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        // 2. Check policy belongs to user
        if (!policy.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to make payment for this policy");
        }

        // 3. Check policy is ACTIVE
        if (!policy.getStatus().equals(PolicyStatus.ACTIVE)) {
            throw new RuntimeException("You can only make payments for ACTIVE policies");
        }

        // 4. Check correct amount
        if (request.getAmount().compareTo(policy.getPlan().getMonthlyPremium()) != 0) {
            throw new RuntimeException("Payment amount must be exactly " + policy.getPlan().getMonthlyPremium());
        }

        // 5. Check not already paid for this month
        if (paymentRepository.findByPolicyIdAndMonthYear(policy.getId(), request.getMonthYear()).isPresent()) {
            throw new RuntimeException("Payment already made for " + request.getMonthYear());
        }

        // NEW: 6. Handle the File Upload
        String storedFileName = null;
        if (request.getReceipt() != null && !request.getReceipt().isEmpty()) {
            storedFileName = saveFile(request.getReceipt());
        } else {
            throw new RuntimeException("Receipt file is required for payment.");
        }

        // 7. Create payment with the new filename/URL
        Payment payment = Payment.builder()
                .policy(policy)
                .amount(request.getAmount())
                .monthYear(request.getMonthYear())
                .paymentDate(LocalDate.now())
                .status(PaymentStatus.PENDING)
                .receiptUrl(storedFileName) // Save the filename/path here
                .build();

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
    }

    // ================================
    // HELPER METHOD TO SAVE FILE
    // ================================
    private String saveFile(org.springframework.web.multipart.MultipartFile file) {
        try {
            // Create directory if it doesn't exist
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(UPLOAD_DIR);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            // Generate a unique file name to avoid overwriting
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = uploadPath.resolve(fileName);

            // Copy file to the target location
            java.nio.file.Files.copy(file.getInputStream(), filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            return fileName; // Or return a full URL if you have a file server set up
        } catch (java.io.IOException e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    // ================================
    // USER VIEWS OWN PAYMENTS
    // ================================
    @Override
    public List<PaymentResponse> getMyPayments(UUID userId) {
        return paymentRepository.findByPolicyUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================================
    // ADMIN VIEWS ALL PAYMENTS
    // ================================
    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================================
    // ADMIN VIEWS BY STATUS
    // ================================
    @Override
    public List<PaymentResponse> getPaymentsByStatus(String status) {
        PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
        return paymentRepository.findByStatus(paymentStatus)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================================
    // ADMIN CONFIRMS PAYMENT
    // ================================
    @Override
    public PaymentResponse confirmPayment(UUID paymentId,
            PaymentConfirmRequest request) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Can only confirm PENDING payments
        if (!payment.getStatus().equals(PaymentStatus.PENDING)) {
            throw new RuntimeException(
                    "Can only confirm PENDING payments");
        }

        payment.setStatus(
                PaymentStatus.valueOf(request.getStatus().toUpperCase()));
        payment.setAdminNote(request.getAdminNote());

        Payment updated = paymentRepository.save(payment);
        return mapToResponse(updated);
    }

    // ================================
    // MAPPER
    // ================================
    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .policyId(payment.getPolicy().getId())
                .planName(payment.getPolicy().getPlan().getName())
                .userFullName(payment.getPolicy().getUser().getFullName())
                .amount(payment.getAmount())
                .monthYear(payment.getMonthYear())
                .paymentDate(payment.getPaymentDate())
                .status(payment.getStatus())
                .receiptUrl(payment.getReceiptUrl())
                .adminNote(payment.getAdminNote())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}