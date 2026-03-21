package com.example.demo.domain.policy.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.policy.model.Policy;
import com.example.demo.domain.policy.model.PolicyStatus;


@Repository
public interface PolicyRepository extends JpaRepository<Policy,UUID> {
    // Get all policies for a specific user
    List<Policy> findByUserId (UUID userId);

    // Get all policies by status (for admin)
    List<Policy> findByStatus(PolicyStatus status);

    // Check if user already has active policy for same plan
    boolean existsByUserIdAndPlanIdAndStatus(UUID userId, UUID planId, PolicyStatus status);

}
