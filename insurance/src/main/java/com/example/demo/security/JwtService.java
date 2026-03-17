package com.example.demo.security;

import java.util.Date;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.demo.domain.auth.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@Service
public class JwtService {
       private final RsaKeyConfig rsaKeyConfig;

    public JwtService(RsaKeyConfig rsaKeyConfig) {
        this.rsaKeyConfig = rsaKeyConfig;
    }

    // 1. GENERATE TOKEN
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())           // who this token belongs to
                .claim("role", user.getRole())      // extra info inside token
                .issuedAt(new Date())               // when token was created
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 hours
                .signWith(rsaKeyConfig.getPrivateKey())  // sign with private key
                .compact();                              // build into a string
    }

    // 2. EXTRACT USERNAME FROM TOKEN
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // 3. VALIDATE TOKEN
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // 4. PRIVATE HELPER METHODS
    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(rsaKeyConfig.getPublicKey())  // verify with public key
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
