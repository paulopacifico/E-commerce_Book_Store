package com.bookstore.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class NoHtmlValidator implements ConstraintValidator<NoHtml, String> {

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]+>");
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("(?i)(javascript:|on\\w+\\s*=|<\\s*script)");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }
        return !HTML_TAG_PATTERN.matcher(value).find() && !SCRIPT_PATTERN.matcher(value).find();
    }
}
