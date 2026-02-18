package com.bookstore.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class AuditLogger {

    private static final Logger AUDIT = LoggerFactory.getLogger("AUDIT");

    public void log(String action, String actor, String target, String outcome, String details) {
        AUDIT.info("action={} actor={} target={} outcome={} details={}",
                safe(action),
                safe(actor),
                safe(target),
                safe(outcome),
                safe(details));
    }

    private String safe(String value) {
        return value == null ? "-" : value.replaceAll("[\\r\\n\\t]", " ").trim();
    }
}
