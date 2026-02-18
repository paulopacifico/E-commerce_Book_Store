package com.bookstore.controller;

import com.bookstore.dto.LoginRequest;
import com.bookstore.dto.RefreshTokenRequest;
import com.bookstore.dto.RegisterRequest;
import com.bookstore.domain.AuthResult;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.service.AuditLogger;
import com.bookstore.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    private AuthService authService;
    private AuditLogger auditLogger;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
        auditLogger = mock(AuditLogger.class);
        AuthController controller = new AuthController(authService, auditLogger);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void register_returnsCreatedAndToken() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "user@test.com",
                "password123",
                "Test",
                "User");

        User user = User.builder()
                .email("user@test.com")
                .firstName("Test")
                .lastName("User")
                .build();
        user.setRole(Role.USER);

        AuthResult result = new AuthResult("jwt-token", "refresh-token", 86400L, user);

        when(authService.register(anyString(), anyString(), anyString(), anyString())).thenReturn(result);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
    }

    @Test
    void login_returnsOkAndToken() throws Exception {
        LoginRequest request = new LoginRequest("user@test.com", "password123");

        User user = User.builder()
                .email("user@test.com")
                .firstName("Test")
                .lastName("User")
                .build();
        user.setRole(Role.USER);

        AuthResult result = new AuthResult("jwt-token", "refresh-token", 86400L, user);

        when(authService.login(anyString(), anyString())).thenReturn(result);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
    }

    @Test
    void refresh_returnsOkAndNewTokenPair() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("old-refresh-token");

        User user = User.builder()
                .email("user@test.com")
                .firstName("Test")
                .lastName("User")
                .build();
        user.setRole(Role.USER);

        AuthResult result = new AuthResult("new-jwt-token", "new-refresh-token", 86400L, user);
        when(authService.refresh("old-refresh-token")).thenReturn(result);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new-jwt-token"))
                .andExpect(jsonPath("$.accessToken").value("new-jwt-token"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh-token"));
    }
}
