package com.example.demo.domain.insurance_plan.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.insurance_plan.dto.InsurancePlanRequest;
import com.example.demo.domain.insurance_plan.dto.InsurancePlanResponse;
import com.example.demo.domain.insurance_plan.service.InsurancePlanService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class InsurancePlanController {

    private final InsurancePlanService planService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<InsurancePlanResponse> createPlan(
            @RequestBody InsurancePlanRequest request) {
        return ResponseEntity.ok(planService.createPlan(request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<InsurancePlanResponse>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    // Activate plan
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<InsurancePlanResponse> activatePlan(@PathVariable UUID id) {
        return ResponseEntity.ok(planService.activatePlan(id));
    }

    @GetMapping("/active")
    public ResponseEntity<List<InsurancePlanResponse>> getActivePlans() {
        return ResponseEntity.ok(planService.getActivePlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurancePlanResponse> getPlanById(@PathVariable UUID id) {
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<InsurancePlanResponse> updatePlan(
            @PathVariable UUID id,
            @RequestBody InsurancePlanRequest request) {
        return ResponseEntity.ok(planService.updatePlan(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deletePlan(@PathVariable UUID id) {
        planService.deletePlan(id);
        return ResponseEntity.ok("Plan deactivated successfully");
    }
}