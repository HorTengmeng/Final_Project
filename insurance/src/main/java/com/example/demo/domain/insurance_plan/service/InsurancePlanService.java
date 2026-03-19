package com.example.demo.domain.insurance_plan.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.domain.insurance_plan.dto.InsurancePlanRequest;
import com.example.demo.domain.insurance_plan.dto.InsurancePlanResponse;

public interface InsurancePlanService {
    InsurancePlanResponse createPlan(InsurancePlanRequest request);   // ADMIN
    List<InsurancePlanResponse> getAllPlans();                         // ALL
    List<InsurancePlanResponse> getActivePlans();                     // ALL
    InsurancePlanResponse getPlanById(UUID id);                       // ALL
    InsurancePlanResponse updatePlan(UUID id, InsurancePlanRequest request); // ADMIN
    void deletePlan(UUID id);  
}
