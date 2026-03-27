package com.example.demo.domain.payment.repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.payment.model.Payment;
import com.example.demo.domain.payment.model.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    // Get all payments for a policy
    List<Payment> findByPolicyId(UUID policyId);

    // Get all payments for a user
    List<Payment> findByPolicyUserId(UUID userId);

    // Get payments by status
    List<Payment> findByStatus(PaymentStatus status);

    // Check if payment already exists for this month
    Optional<Payment> findByPolicyIdAndMonthYear(UUID policyId, String monthYear);
}
