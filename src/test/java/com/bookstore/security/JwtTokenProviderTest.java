package com.bookstore.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private static final long ONE_HOUR_MS = 3_600_000L;
    private static final String STRONG_RAW_SECRET = "testJwtSecretWithAtLeastThirtyTwoBytesForHs256";

    @Test
    void constructorRejectsWeakJwtSecret() {
        assertThatThrownBy(() -> new JwtTokenProvider("short-secret", ONE_HOUR_MS))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 bytes");
    }

    @Test
    void generatedTokenValidatesWithStrongRawSecret() {
        JwtTokenProvider jwtTokenProvider = new JwtTokenProvider(STRONG_RAW_SECRET, ONE_HOUR_MS);

        String token = jwtTokenProvider.generateToken("reader@example.com");

        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUsernameFromToken(token)).isEqualTo("reader@example.com");
        assertThat(jwtTokenProvider.getJwtExpirationSeconds()).isEqualTo(3_600L);
    }

    @Test
    void generatedTokenValidatesWithStrongBase64Secret() {
        String base64Secret = Base64.getEncoder()
                .encodeToString("12345678901234567890123456789012".getBytes(StandardCharsets.UTF_8));
        JwtTokenProvider jwtTokenProvider = new JwtTokenProvider(base64Secret, ONE_HOUR_MS);

        String token = jwtTokenProvider.generateToken("reader@example.com");

        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUsernameFromToken(token)).isEqualTo("reader@example.com");
    }

    @Test
    void applicationContextFailsFastWhenJwtSecretIsWeak() {
        ApplicationContextRunner contextRunner = new ApplicationContextRunner()
                .withUserConfiguration(JwtTokenProvider.class)
                .withPropertyValues(
                        "jwt.secret=short-secret",
                        "jwt.expiration=" + ONE_HOUR_MS);

        contextRunner.run(context -> {
            assertThat(context).hasFailed();
            assertThat(context.getStartupFailure())
                    .hasRootCauseInstanceOf(IllegalStateException.class)
                    .rootCause()
                    .hasMessageContaining("at least 32 bytes");
        });
    }
}
