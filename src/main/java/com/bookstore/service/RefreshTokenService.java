package com.bookstore.service;

import com.bookstore.entity.RefreshToken;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class RefreshTokenService {

    private static final int TOKEN_BYTES = 48;

    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshTokenExpirationMs;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
            @Value("${jwt.refresh-expiration:604800000}") long refreshTokenExpirationMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    @Transactional
    public RefreshToken createForUser(User user) {
        refreshTokenRepository.deleteByUserId(user.getId());
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(generateTokenValue());
        refreshToken.setExpiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshTokenExpirationMs)));
        refreshToken.setRevoked(false);
        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken rotate(String rawToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenAndRevokedFalse(rawToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
        if (existing.getExpiresAt().isBefore(LocalDateTime.now())) {
            existing.setRevoked(true);
            refreshTokenRepository.save(existing);
            throw new BadRequestException("Refresh token expired");
        }

        existing.setRevoked(true);
        refreshTokenRepository.save(existing);
        return createForUser(existing.getUser());
    }

    private String generateTokenValue() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
