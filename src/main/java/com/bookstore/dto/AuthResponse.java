package com.bookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Authentication response with tokens and user info")
public class AuthResponse {
    @Schema(description = "JWT access token (use in Authorization header)")
    private String token;
    @Schema(description = "JWT access token")
    private String accessToken;
    @Schema(description = "Refresh token for obtaining new access tokens")
    private String refreshToken;
    @Schema(description = "Token type", example = "Bearer")
    private String tokenType;
    @Schema(description = "Access token expiration time in seconds")
    private Long expiresIn;
    @Schema(description = "User email")
    private String email;
    @Schema(description = "User first name")
    private String firstName;
    @Schema(description = "User last name")
    private String lastName;
    @Schema(description = "User role", example = "USER")
    private String role;
}
