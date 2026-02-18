package com.bookstore.validation;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NoHtmlValidatorTest {

    private final NoHtmlValidator validator = new NoHtmlValidator();

    @Test
    void allowsPlainText() {
        assertThat(validator.isValid("Clean Code", null)).isTrue();
    }

    @Test
    void rejectsHtmlTag() {
        assertThat(validator.isValid("<b>bold</b>", null)).isFalse();
    }

    @Test
    void rejectsScriptVector() {
        assertThat(validator.isValid("javascript:alert(1)", null)).isFalse();
    }
}
