package com.example.demo.domain.claims.repository;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.claims.model.Claim;
import com.example.demo.domain.claims.model.ClaimStatus;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, UUID> {

    // Get all claims for a specific policy
    List<Claim> findByPolicyId(UUID policyId);

    // Get all claims for a specific user through policy
    List<Claim> findByPolicyUserId(UUID userId);

    // Get claims by status (for admin)
    List<Claim> findByStatus(ClaimStatus status);
}
