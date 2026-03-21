package com.example.demo.domain.policy.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class PolicyRequest {
    private UUID planId; // user just picks which plan they want
}
