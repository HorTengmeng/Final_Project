package com.example.demo.domain.policy.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class PolicyRequest {
    private UUID planId;
    private String address;
    private String dateOfBirth;
    private String occupation;
    private String medicalHistory;
    private String beneficiaryName;
    private String beneficiaryRelationship;
    public void setDocumentUrl(String documentUrl) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setDocumentUrl'");
    } 
}
