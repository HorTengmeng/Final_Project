package com.example.demo.domain.policy.service;
import java.util.List;
import java.util.UUID;

import com.example.demo.domain.policy.dto.AdminNoteRequest;
import com.example.demo.domain.policy.dto.PolicyRequest;
import com.example.demo.domain.policy.dto.PolicyResponse;

public interface PolicyService {

    // USER applies for a plan
    PolicyResponse applyPolicy(UUID userId, PolicyRequest request);

    // USER views their own policies
    List<PolicyResponse> getMyPolicies(UUID userId);

    // ADMIN views all policies
    List<PolicyResponse> getAllPolicies();

    // ADMIN views policies by status
    List<PolicyResponse> getPoliciesByStatus(String status);

    // ADMIN approves or rejects policy
    PolicyResponse updatePolicyStatus(UUID policyId, AdminNoteRequest request);

    // USER cancels their own policy
    PolicyResponse cancelPolicy(UUID policyId, UUID userId);
}
