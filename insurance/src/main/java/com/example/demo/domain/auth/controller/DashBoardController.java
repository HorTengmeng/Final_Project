package com.example.demo.domain.auth.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.auth.repository.UserRepository;
import com.example.demo.domain.claims.repository.ClaimRepository;
import com.example.demo.domain.payment.repository.PaymentRepository;
import com.example.demo.domain.policy.repository.PolicyRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashBoardController {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping("/admin/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Long>> getAdminStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalPolicies", policyRepository.count());
        stats.put("totalClaims", claimRepository.count());
        stats.put("totalPayments", paymentRepository.count());
        return ResponseEntity.ok(stats);
    }
}
