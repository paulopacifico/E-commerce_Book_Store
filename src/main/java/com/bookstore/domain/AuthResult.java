package com.bookstore.domain;

import com.bookstore.entity.User;

public class AuthResult {

    private final String accessToken;
    private final String refreshToken;
    private final long expiresInSeconds;
    private final User user;

    public AuthResult(String accessToken, String refreshToken, long expiresInSeconds, User user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresInSeconds = expiresInSeconds;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public User getUser() {
        return user;
    }
}
