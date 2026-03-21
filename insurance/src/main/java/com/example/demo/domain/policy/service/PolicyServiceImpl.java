package com.example.demo.domain.policy.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.domain.auth.model.User;
import com.example.demo.domain.auth.repository.UserRepository;
import com.example.demo.domain.insurance_plan.model.InsurancePlan;
import com.example.demo.domain.insurance_plan.repository.InsurancePlanRepository;
import com.example.demo.domain.policy.dto.AdminNoteRequest;
import com.example.demo.domain.policy.dto.PolicyRequest;
import com.example.demo.domain.policy.dto.PolicyResponse;
import com.example.demo.domain.policy.model.Policy;
import com.example.demo.domain.policy.model.PolicyStatus;
import com.example.demo.domain.policy.repository.PolicyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final InsurancePlanRepository planRepository;

    // ================================
    // USER APPLIES FOR A PLAN
    // ================================
    @Override
    public PolicyResponse applyPolicy(UUID userId, PolicyRequest request) {

        // 1. Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Find plan
        InsurancePlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        // 3. Check plan is active
        if (!plan.getIsActive()) {
            throw new RuntimeException("Plan is not available");
        }

        // 4. Check user doesn't already have active policy for same plan
        boolean alreadyExists = policyRepository.existsByUserIdAndPlanIdAndStatus(
                userId, plan.getId(), PolicyStatus.PENDING)
                ||
                policyRepository.existsByUserIdAndPlanIdAndStatus(
                        userId, plan.getId(), PolicyStatus.ACTIVE);

        if (alreadyExists) {
            throw new RuntimeException(
                    "You already have a pending or active policy for this plan");
        }

        // 5. Create policy
        Policy policy = Policy.builder()
                .user(user)
                .plan(plan)
                .status(PolicyStatus.PENDING) // always starts as PENDING
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(plan.getDurationMonths()))
                .build();

        Policy saved = policyRepository.save(policy);
        return mapToResponse(saved);
    }

    // ================================
    // USER VIEWS OWN POLICIES
    // ================================
    @Override
    public List<PolicyResponse> getMyPolicies(UUID userId) {
        return policyRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================================
    // ADMIN VIEWS ALL POLICIES
    // ================================
    @Override
    public List<PolicyResponse> getAllPolicies() {
        return policyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================================
    // ADMIN VIEWS BY STATUS
    // ================================
    @Override
    public List<PolicyResponse> getPoliciesByStatus(String status) {
        PolicyStatus policyStatus = PolicyStatus.valueOf(status.toUpperCase());
        return policyRepository.findByStatus(policyStatus)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================================
    // ADMIN APPROVES OR REJECTS
    // ================================
    @Override
    public PolicyResponse updatePolicyStatus(UUID policyId, AdminNoteRequest request) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        policy.setStatus(PolicyStatus.valueOf(request.getStatus().toUpperCase()));
        policy.setAdminNote(request.getAdminNote());

        Policy updated = policyRepository.save(policy);
        return mapToResponse(updated);
    }

    // ================================
    // USER CANCELS POLICY
    // ================================
    @Override
    public PolicyResponse cancelPolicy(UUID policyId, UUID userId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        // Make sure user owns this policy
        if (!policy.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to cancel this policy");
        }

        policy.setStatus(PolicyStatus.CANCELLED);
        Policy updated = policyRepository.save(policy);
        return mapToResponse(updated);
    }

    // ================================
    // MAPPER
    // ================================
    private PolicyResponse mapToResponse(Policy policy) {
        return PolicyResponse.builder()
                .id(policy.getId())
                .userId(policy.getUser().getId())
                .userFullName(policy.getUser().getFullName())
                .planId(policy.getPlan().getId())
                .planName(policy.getPlan().getName())
                .planType(policy.getPlan().getType())
                .status(policy.getStatus())
                .startDate(policy.getStartDate())
                .endDate(policy.getEndDate())
                .adminNote(policy.getAdminNote())
                .createdAt(policy.getCreatedAt())
                .build();
    }

}
