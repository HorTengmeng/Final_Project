package com.example.demo.domain.policy.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.example.demo.domain.auth.model.User;
import com.example.demo.domain.insurance_plan.model.InsurancePlan;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "policies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Policy {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name="user_id",nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private InsurancePlan plan;    

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyStatus status;

    private LocalDate startDate;
    private LocalDate endDate;

    private String adminNote;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
