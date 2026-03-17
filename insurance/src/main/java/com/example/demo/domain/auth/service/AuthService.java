package com.example.demo.domain.auth.service;

import com.example.demo.domain.auth.dto.AuthResponse;
import com.example.demo.domain.auth.dto.LoginRequest;
import com.example.demo.domain.auth.dto.RegisterRequest;

public interface  AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);   
}
