package com.bookstore.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    private static final int MIN_KEY_LENGTH_BYTES = 32; // 256 bits for HS256

    private final SecretKey signingKey;
    private final long jwtExpiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.expiration}") long jwtExpiration) {
        this.signingKey = buildSigningKey(jwtSecret);
        this.jwtExpiration = jwtExpiration;
    }

    /**
     * Builds the signing key from the configured secret.
     * Supports both raw text (UTF-8) and Base64-encoded secrets.
     * For HS256, the key must be at least 256 bits (32 bytes).
     */
    private static SecretKey buildSigningKey(String jwtSecret) {
        byte[] keyBytes = resolveKeyBytes(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private static byte[] resolveKeyBytes(String jwtSecret) {
        if (!StringUtils.hasText(jwtSecret)) {
            throw new IllegalStateException("JWT secret must be configured and contain at least 32 bytes for HS256 signing");
        }

        String normalizedSecret = jwtSecret.trim();
        byte[] decodedKeyBytes = tryDecodeBase64(normalizedSecret);
        if (decodedKeyBytes != null && decodedKeyBytes.length >= MIN_KEY_LENGTH_BYTES) {
            return decodedKeyBytes;
        }

        byte[] rawKeyBytes = normalizedSecret.getBytes(StandardCharsets.UTF_8);
        if (rawKeyBytes.length >= MIN_KEY_LENGTH_BYTES) {
            return rawKeyBytes;
        }

        throw new IllegalStateException("JWT secret must contain at least 32 bytes for HS256 signing");
    }

    private static byte[] tryDecodeBase64(String value) {
        try {
            return Decoders.BASE64.decode(value);
        } catch (Exception e) {
            return null;
        }
    }

    private SecretKey getSigningKey() {
        return signingKey;
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
            log.debug("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.debug("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.debug("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.debug("JWT claims string is empty");
        }
        return false;
    }
}
