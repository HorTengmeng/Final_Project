package com.example.demo.domain.claims.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.auth.model.User;
import com.example.demo.domain.claims.dto.ClaimRequest;
import com.example.demo.domain.claims.dto.ClaimResponse;
import com.example.demo.domain.claims.dto.ClaimReviewRequest;
import com.example.demo.domain.claims.repository.ClaimRepository;
import com.example.demo.domain.claims.service.ClaimService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;
    private final ClaimRepository claimrepository;
    // USER files a claim
    @PostMapping
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<ClaimResponse> fileClaim(
            @AuthenticationPrincipal User currentUser,
            @RequestBody ClaimRequest request) {
        return ResponseEntity.ok(
            claimService.fileClaim(currentUser.getId(), request));
    }

    // USER views own claims
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<List<ClaimResponse>> getMyClaims(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
            claimService.getMyClaims(currentUser.getId()));
    }

    // ADMIN views all claims
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ClaimResponse>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    // ADMIN filters by status
    @GetMapping("/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ClaimResponse>> getClaimsByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(claimService.getClaimsByStatus(status));
    }

    // ADMIN reviews claim
    @PutMapping("/{id}/review")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ClaimResponse> reviewClaim(
            @PathVariable UUID id,
            @RequestBody ClaimReviewRequest request) {
        return ResponseEntity.ok(claimService.reviewClaim(id, request));
    }
    @DeleteMapping("/{id}")
@PreAuthorize("hasAuthority('ADMIN')")
public ResponseEntity<Map<String, String>> deleteClaim(
        @PathVariable UUID id) {
    claimrepository.deleteById(id);
    Map<String, String> response = new HashMap<>();
    response.put("message", "Claim deleted successfully");
    return ResponseEntity.ok(response);
}
}
