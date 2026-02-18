package com.bookstore.controller;

import com.bookstore.dto.AuthResponse;
import com.bookstore.dto.LoginRequest;
import com.bookstore.dto.RefreshTokenRequest;
import com.bookstore.dto.RegisterRequest;
import com.bookstore.domain.AuthResult;
import com.bookstore.entity.User;
import com.bookstore.service.AuditLogger;
import com.bookstore.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuditLogger auditLogger;

    public AuthController(AuthService authService, AuditLogger auditLogger) {
        this.authService = authService;
        this.auditLogger = auditLogger;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResult result = authService.register(
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName());
        auditLogger.log("AUTH_REGISTER", result.getUser().getEmail(), "USER", "SUCCESS", "New account created");
        AuthResponse response = toAuthResponse(result);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResult result = authService.login(request.getEmail(), request.getPassword());
        auditLogger.log("AUTH_LOGIN", result.getUser().getEmail(), "USER", "SUCCESS", "User login");
        AuthResponse response = toAuthResponse(result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResult result = authService.refresh(request.getRefreshToken());
        auditLogger.log("AUTH_REFRESH", result.getUser().getEmail(), "USER", "SUCCESS", "Token refreshed");
        AuthResponse response = toAuthResponse(result);
        return ResponseEntity.ok(response);
    }

    private AuthResponse toAuthResponse(AuthResult result) {
        User user = result.getUser();
        return AuthResponse.builder()
                .token(result.getAccessToken())
                .accessToken(result.getAccessToken())
                .refreshToken(result.getRefreshToken())
                .tokenType("Bearer")
                .expiresIn(result.getExpiresInSeconds())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
    }
}
