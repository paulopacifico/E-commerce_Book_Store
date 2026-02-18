package com.bookstore.security;

import com.bookstore.config.RateLimitProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, CounterWindow> counters = new ConcurrentHashMap<>();
    private final RateLimitProperties properties;

    public RateLimitFilter(RateLimitProperties properties) {
        this.properties = properties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/")
                || path.startsWith("/api/actuator")
                || path.startsWith("/api-docs")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/h2-console");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long now = System.currentTimeMillis();
        long windowMs = properties.getWindowSeconds() * 1000L;
        String clientKey = resolveClientKey(request);

        CounterWindow counter = counters.compute(clientKey, (key, existing) -> {
            if (existing == null || now - existing.windowStartMs >= windowMs) {
                return new CounterWindow(now, new AtomicInteger(1));
            }
            existing.counter.incrementAndGet();
            return existing;
        });

        if (counter.counter.get() > properties.getMaxRequests()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            String payload = "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":"
                    + "\"Rate limit exceeded. Please try again later.\",\"path\":\""
                    + request.getRequestURI() + "\",\"timestamp\":\"" + LocalDateTime.now() + "\"}";
            response.getWriter().write(payload);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientKey(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record CounterWindow(long windowStartMs, AtomicInteger counter) {
    }
}
