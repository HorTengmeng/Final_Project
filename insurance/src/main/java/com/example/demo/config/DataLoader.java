package com.example.demo.config; // ← changed package

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.demo.domain.auth.model.Role;
import com.example.demo.domain.auth.model.User;
import com.example.demo.domain.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        loadUsers();
    }

    private void loadUsers() {

        if (userRepository.findByEmail("admin@insurance.com").isEmpty()) {
            User admin = User.builder()
                    .fullName("System Admin")
                    .email("admin@insurance.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("012000000")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("✅ Default ADMIN created: admin@insurance.com");
        } else {
            log.info("⏭️ ADMIN already exists, skipping...");
        }

        if (userRepository.findByEmail("user@insurance.com").isEmpty()) {
            User user = User.builder()
                    .fullName("Default User")
                    .email("user@insurance.com")
                    .password(passwordEncoder.encode("user123"))
                    .phone("012000001")
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
            log.info("✅ Default USER created: user@insurance.com");
        } else {
            log.info("⏭️ USER already exists, skipping...");
        }
    }
}