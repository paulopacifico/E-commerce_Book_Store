package com.bookstore.security;

import com.bookstore.config.RateLimitProperties;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {

    @Test
    void blocksAfterLimitExceeded() throws ServletException, IOException {
        RateLimitProperties properties = new RateLimitProperties();
        properties.setMaxRequests(1);
        properties.setWindowSeconds(60);
        RateLimitFilter filter = new RateLimitFilter(properties);

        MockHttpServletRequest first = new MockHttpServletRequest("GET", "/api/books");
        first.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse firstResponse = new MockHttpServletResponse();
        filter.doFilter(first, firstResponse, (req, res) -> {
            ((MockHttpServletResponse) res).setStatus(200);
        });
        assertThat(firstResponse.getStatus()).isEqualTo(200);

        MockHttpServletRequest second = new MockHttpServletRequest("GET", "/api/books");
        second.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse secondResponse = new MockHttpServletResponse();
        filter.doFilter(second, secondResponse, (req, res) -> {
            ((MockHttpServletResponse) res).setStatus(200);
        });

        assertThat(secondResponse.getStatus()).isEqualTo(429);
        assertThat(secondResponse.getContentAsString()).contains("Rate limit exceeded");
    }
}
