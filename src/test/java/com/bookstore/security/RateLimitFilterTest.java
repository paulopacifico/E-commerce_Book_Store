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

        MockHttpServletRequest first = new MockHttpServletRequest("POST", "/api/auth/login");
        first.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse firstResponse = new MockHttpServletResponse();
        filter.doFilter(first, firstResponse, (req, res) -> {
            ((MockHttpServletResponse) res).setStatus(200);
        });
        assertThat(firstResponse.getStatus()).isEqualTo(200);

        MockHttpServletRequest second = new MockHttpServletRequest("POST", "/api/auth/login");
        second.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse secondResponse = new MockHttpServletResponse();
        filter.doFilter(second, secondResponse, (req, res) -> {
            ((MockHttpServletResponse) res).setStatus(200);
        });

        assertThat(secondResponse.getStatus()).isEqualTo(429);
        assertThat(secondResponse.getContentAsString()).contains("Rate limit exceeded");
    }

    @Test
    void skipsPublicCatalogReadsAndPreflightRequests() throws ServletException, IOException {
        RateLimitProperties properties = new RateLimitProperties();
        properties.setMaxRequests(0);
        RateLimitFilter filter = new RateLimitFilter(properties);

        MockHttpServletRequest catalogRequest = new MockHttpServletRequest("GET", "/api/books/5");
        MockHttpServletResponse catalogResponse = new MockHttpServletResponse();
        filter.doFilter(catalogRequest, catalogResponse, (req, res) -> {
            ((MockHttpServletResponse) res).setStatus(200);
        });

        MockHttpServletRequest preflightRequest = new MockHttpServletRequest("OPTIONS", "/api/cart");
        MockHttpServletResponse preflightResponse = new MockHttpServletResponse();
        filter.doFilter(preflightRequest, preflightResponse, (req, res) -> {
            ((MockHttpServletResponse) res).setStatus(204);
        });

        assertThat(catalogResponse.getStatus()).isEqualTo(200);
        assertThat(preflightResponse.getStatus()).isEqualTo(204);
    }
}
