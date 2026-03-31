package com.example.demo.domain.insurance_plan.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.domain.insurance_plan.dto.InsurancePlanRequest;
import com.example.demo.domain.insurance_plan.dto.InsurancePlanResponse;
import com.example.demo.domain.insurance_plan.model.InsurancePlan;
import com.example.demo.domain.insurance_plan.repository.InsurancePlanRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InsurancePlanServiceImpl implements InsurancePlanService {

    private final InsurancePlanRepository planRepository;

    // ================================
    // CREATE
    // ================================
    @Override
    public InsurancePlanResponse createPlan(InsurancePlanRequest request) {
        InsurancePlan plan = InsurancePlan.builder()
                .name(request.getName())
                .type(request.getType())
                .description(request.getDescription())
                .coverageAmount(request.getCoverageAmount())
                .monthlyPremium(request.getMonthlyPremium())
                .durationMonths(request.getDurationMonths())
                .isActive(true)
                .build();

        InsurancePlan saved = planRepository.save(plan);
        return mapToResponse(saved);
    }

    // ================================
    // GET ALL
    // ================================
    @Override
    public List<InsurancePlanResponse> getAllPlans() {
        return planRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InsurancePlanResponse activatePlan(UUID id) {
        InsurancePlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setIsActive(true);
        InsurancePlan updated = planRepository.save(plan);
        return mapToResponse(updated);
    }

    // GET ACTIVE ONLY
    @Override
    public List<InsurancePlanResponse> getActivePlans() {
        return planRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ================================
    // GET BY ID
    // ================================
    @Override
    public InsurancePlanResponse getPlanById(UUID id) {
        InsurancePlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        return mapToResponse(plan);
    }

    // ================================
    // UPDATE
    // ================================
    @Override
    public InsurancePlanResponse updatePlan(UUID id, InsurancePlanRequest request) {
        InsurancePlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setName(request.getName());
        plan.setType(request.getType());
        plan.setDescription(request.getDescription());
        plan.setCoverageAmount(request.getCoverageAmount());
        plan.setMonthlyPremium(request.getMonthlyPremium());
        plan.setDurationMonths(request.getDurationMonths());

        InsurancePlan updated = planRepository.save(plan);
        return mapToResponse(updated);
    }

    // ================================
    // DELETE (soft delete)
    // ================================
    @Override
    public void deletePlan(UUID id) {
        InsurancePlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setIsActive(false); // ← soft delete, not actually removing from DB
        planRepository.save(plan);
    }

    // ================================
    // MAPPER
    // ================================
    private InsurancePlanResponse mapToResponse(InsurancePlan plan) {
        return InsurancePlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .type(plan.getType())
                .description(plan.getDescription())
                .coverageAmount(plan.getCoverageAmount())
                .monthlyPremium(plan.getMonthlyPremium())
                .durationMonths(plan.getDurationMonths())
                .isActive(plan.getIsActive())
                .createdAt(plan.getCreatedAt())
                .build();
    }
}