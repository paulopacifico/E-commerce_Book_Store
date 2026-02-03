package com.bookstore.domain;

import com.bookstore.entity.User;

public class AuthResult {

    private final String token;
    private final User user;

    public AuthResult(String token, User user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public User getUser() {
        return user;
    }
}
