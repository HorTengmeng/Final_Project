package com.example.demo.domain.insurance_plan.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.insurance_plan.model.InsurancePlan;
import java.util.List;


@Repository
public interface  InsurancePlanRepository extends JpaRepository<InsurancePlan, UUID> {
    // Find all active plan
    List<InsurancePlan> findByIsActiveTrue();

    // Find plan by type
    List<InsurancePlan> findByType(String type);
}
