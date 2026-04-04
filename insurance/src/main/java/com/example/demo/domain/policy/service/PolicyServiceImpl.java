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

    // USER APPLIES FOR A PLAN
    @Override
    public PolicyResponse applyPolicy(UUID userId, PolicyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InsurancePlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        // Prevent duplicate pending applications
        if (policyRepository.existsByUserIdAndPlanIdAndStatus(userId, plan.getId(), PolicyStatus.PENDING)) {
            throw new RuntimeException("You already have a pending application for this plan");
        }

    Policy policy = Policy.builder()
        .user(user)
        .plan(plan)
        .status(PolicyStatus.PENDING)
        .startDate(LocalDate.now())
        .endDate(LocalDate.now()
            .plusMonths(plan.getDurationMonths()))
        .dateOfBirth(request.getDateOfBirth())    // ← ADD
        .address(request.getAddress())             // ← ADD
        .occupation(request.getOccupation())       // ← ADD
        .medicalHistory(request.getMedicalHistory()) // ← ADD
        .beneficiaryName(request.getBeneficiaryName()) // ← ADD
        .beneficiaryRelationship(                  // ← ADD
            request.getBeneficiaryRelationship())
        .build();

        Policy saved = policyRepository.save(policy);
        return mapToResponse(saved);
    }

    // USER VIEWS OWN POLICIES
    @Override
    public List<PolicyResponse> getMyPolicies(UUID userId) {
        return policyRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ADMIN VIEWS ALL POLICIES
    @Override
    public List<PolicyResponse> getAllPolicies() {
        return policyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ADMIN VIEWS BY STATUS
    @Override
    public List<PolicyResponse> getPoliciesByStatus(String status) {
        PolicyStatus policyStatus = PolicyStatus.valueOf(status.toUpperCase());
        return policyRepository.findByStatus(policyStatus)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ADMIN APPROVES OR REJECTS
    @Override
    public PolicyResponse updatePolicyStatus(UUID policyId, AdminNoteRequest request) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        policy.setStatus(PolicyStatus.valueOf(request.getStatus().toUpperCase()));
        policy.setAdminNote(request.getAdminNote());

        Policy updated = policyRepository.save(policy);
        return mapToResponse(updated);
    }

    // USER CANCELS POLICY
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

    // MAPPER
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
