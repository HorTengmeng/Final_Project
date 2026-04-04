package com.example.demo.domain.policy.controller;

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
import com.example.demo.domain.policy.dto.AdminNoteRequest;
import com.example.demo.domain.policy.dto.PolicyRequest;
import com.example.demo.domain.policy.dto.PolicyResponse;
import com.example.demo.domain.policy.repository.PolicyRepository;
import com.example.demo.domain.policy.service.PolicyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;
    private final PolicyRepository policyRepository;

    // USER applies for a plan
    // USER applies for a plan (Updated to JSON)
    @PostMapping("/apply")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<PolicyResponse> applyPolicy(
            @AuthenticationPrincipal User currentUser,
            @RequestBody PolicyRequest request) { // Use @RequestBody for JSON

        // We no longer handle MultipartFile here
        return ResponseEntity.ok(
                policyService.applyPolicy(currentUser.getId(), request));
    }

    // USER views their own policies
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<List<PolicyResponse>> getMyPolicies(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                policyService.getMyPolicies(currentUser.getId()));
    }

    // ADMIN views all policies
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<PolicyResponse>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    // ADMIN filters by status
    @GetMapping("/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<PolicyResponse>> getPoliciesByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(policyService.getPoliciesByStatus(status));
    }

    // ADMIN approves or rejects
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PolicyResponse> updatePolicyStatus(
            @PathVariable UUID id,
            @RequestBody AdminNoteRequest request) {
        return ResponseEntity.ok(policyService.updatePolicyStatus(id, request));
    }

    // USER cancels own policy
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<PolicyResponse> cancelPolicy(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                policyService.cancelPolicy(id, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, String>> deletePolicy(
            @PathVariable UUID id) {
        policyRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Policy deleted successfully");
        return ResponseEntity.ok(response);
    }
}