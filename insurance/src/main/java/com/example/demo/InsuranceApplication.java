package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.example.demo.security.RsaKeyConfig;

@SpringBootApplication
@EnableConfigurationProperties(RsaKeyConfig.class) // ← ADD THIS

public class InsuranceApplication {
	public static void main(String[] args) {
		SpringApplication.run(InsuranceApplication.class, args);
	}
}
