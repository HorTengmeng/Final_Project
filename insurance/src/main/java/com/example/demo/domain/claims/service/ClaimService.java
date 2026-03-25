package com.example.demo.domain.claims.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.domain.claims.dto.ClaimRequest;
import com.example.demo.domain.claims.dto.ClaimResponse;
import com.example.demo.domain.claims.dto.ClaimReviewRequest;



public interface ClaimService {

    // USER files a claim
    ClaimResponse fileClaim(UUID userId, ClaimRequest request);

    // USER views their own claims
    List<ClaimResponse> getMyClaims(UUID userId);

    // ADMIN views all claims
    List<ClaimResponse> getAllClaims();

    // ADMIN views claims by status
    List<ClaimResponse> getClaimsByStatus(String status);

    // ADMIN reviews claim
    ClaimResponse reviewClaim(UUID claimId, ClaimReviewRequest request);
}
