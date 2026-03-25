package com.example.demo.domain.claims.service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.domain.claims.dto.ClaimRequest;
import com.example.demo.domain.claims.dto.ClaimResponse;
import com.example.demo.domain.claims.dto.ClaimReviewRequest;
import com.example.demo.domain.claims.model.Claim;
import com.example.demo.domain.claims.model.ClaimStatus;
import com.example.demo.domain.claims.repository.ClaimRepository;
import com.example.demo.domain.policy.model.Policy;
import com.example.demo.domain.policy.model.PolicyStatus;
import com.example.demo.domain.policy.repository.PolicyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;

    // ================================
    // USER FILES A CLAIM
    // ================================
    @Override
    public ClaimResponse fileClaim(UUID userId, ClaimRequest request) {

        // 1. Find policy
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        // 2. Make sure policy belongs to this user
        if (!policy.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                "You are not authorized to file a claim for this policy");
        }

        // 3. Make sure policy is ACTIVE
        if (!policy.getStatus().equals(PolicyStatus.ACTIVE)) {
            throw new RuntimeException(
                "You can only file claims for ACTIVE policies");
        }

        // 4. Make sure amount doesn't exceed coverage
        if (request.getAmountRequested()
                .compareTo(policy.getPlan().getCoverageAmount()) > 0) {
            throw new RuntimeException(
                "Claim amount exceeds coverage amount of "
                + policy.getPlan().getCoverageAmount());
        }

        // 5. Create claim
        Claim claim = Claim.builder()
                .policy(policy)
                .reason(request.getReason())
                .amountRequested(request.getAmountRequested())
                .status(ClaimStatus.PENDING)
                .build();

        Claim saved = claimRepository.save(claim);
        return mapToResponse(saved);
    }

    // ================================
    // USER VIEWS OWN CLAIMS
    // ================================
    @Override
    public List<ClaimResponse> getMyClaims(UUID userId) {
        return claimRepository.findByPolicyUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================================
    // ADMIN VIEWS ALL CLAIMS
    // ================================
    @Override
    public List<ClaimResponse> getAllClaims() {
        return claimRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================================
    // ADMIN VIEWS BY STATUS
    // ================================
    @Override
    public List<ClaimResponse> getClaimsByStatus(String status) {
        ClaimStatus claimStatus = ClaimStatus.valueOf(status.toUpperCase());
        return claimRepository.findByStatus(claimStatus)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================================
    // ADMIN REVIEWS CLAIM
    // ================================
    @Override
    public ClaimResponse reviewClaim(UUID claimId, ClaimReviewRequest request) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        // Can only review PENDING claims
        if (!claim.getStatus().equals(ClaimStatus.PENDING)) {
            throw new RuntimeException(
                "Can only review PENDING claims");
        }

        claim.setStatus(ClaimStatus.valueOf(request.getStatus().toUpperCase()));
        claim.setAdminNote(request.getAdminNote());

        Claim updated = claimRepository.save(claim);
        return mapToResponse(updated);
    }

    // ================================
    // MAPPER
    // ================================
    private ClaimResponse mapToResponse(Claim claim) {
        return ClaimResponse.builder()
                .id(claim.getId())
                .policyId(claim.getPolicy().getId())
                .planName(claim.getPolicy().getPlan().getName())
                .userFullName(claim.getPolicy().getUser().getFullName())
                .reason(claim.getReason())
                .amountRequested(claim.getAmountRequested())
                .status(claim.getStatus())
                .adminNote(claim.getAdminNote())
                .createdAt(claim.getCreatedAt())
                .build();
    }
}
