package com.example.demo.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException, java.io.IOException {

        // STEP 1: Get Authorization header
        final String authHeader = request.getHeader("Authorization");

        // STEP 2: Check if token exists
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token → skip this filter → go to next filter
            filterChain.doFilter(request, response);
            return;
        }

        // STEP 3: Extract the JWT token
        final String jwt = authHeader.substring(7); // Remove "Bearer " prefix
        final String userEmail = jwtService.extractUsername(jwt);

        // STEP 4: Check if not already authenticated
        if (userEmail != null && null == SecurityContextHolder.getContext().getAuthentication()) {

            // Load user from database
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);

            // ================================
            // STEP 5: Validate the token
            // ================================
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // Create authentication object
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,                           // no credentials needed
                                userDetails.getAuthorities()   // roles/permissions
                        );

                // Add request details to auth object
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // ================================
                // STEP 6: Set user as authenticated
                // ================================
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Continue to next filter
        filterChain.doFilter(request, response);
    }
}