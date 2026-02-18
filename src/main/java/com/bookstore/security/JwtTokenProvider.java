package com.bookstore.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final int MIN_KEY_LENGTH_BYTES = 32; // 256 bits for HS256

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Builds the signing key from the configured secret.
     * Supports both raw text (UTF-8) and Base64-encoded secrets.
     * For HS256, the key is at least 256 bits (32 bytes).
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = tryDecodeBase64(jwtSecret);
        if (keyBytes == null || keyBytes.length == 0) {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < MIN_KEY_LENGTH_BYTES) {
            keyBytes = Arrays.copyOf(keyBytes, MIN_KEY_LENGTH_BYTES);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private static byte[] tryDecodeBase64(String value) {
        try {
            return Decoders.BASE64.decode(value);
        } catch (Exception e) {
            return null;
        }
    }

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return generateToken(userDetails.getUsername());
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public long getJwtExpirationSeconds() {
        return jwtExpiration / 1000;
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException ex) {
            System.err.println("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            System.err.println("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty");
        }
        return false;
    }
}
