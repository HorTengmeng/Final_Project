package com.example.demo.config;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ================================
    // Handle RuntimeException (our custom errors)
    // ================================
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status", 400);
        error.put("error", "Bad Request");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // ================================
    // Handle 403 Forbidden
    // ================================
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(
            AccessDeniedException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status", 403);
        error.put("error", "Forbidden");
        error.put("message", "You don't have permission to access this resource");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // ================================
    // Handle general exceptions
    // ================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(
            Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status", 500);
        error.put("error", "Internal Server Error");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}