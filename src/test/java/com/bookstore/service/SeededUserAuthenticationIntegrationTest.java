package com.bookstore.service;

import com.bookstore.domain.AuthResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class SeededUserAuthenticationIntegrationTest {

    @Autowired
    private AuthService authService;

    @Test
    void localSeedUsersAuthenticateWithDocumentedPasswords() {
        AuthResult adminSession = authService.login("admin@bookstore.com", "admin123");
        AuthResult readerSession = authService.login("user@test.com", "user123");

        assertThat(adminSession.getAccessToken()).isNotBlank();
        assertThat(adminSession.getUser().getEmail()).isEqualTo("admin@bookstore.com");
        assertThat(readerSession.getAccessToken()).isNotBlank();
        assertThat(readerSession.getUser().getEmail()).isEqualTo("user@test.com");
    }
}
