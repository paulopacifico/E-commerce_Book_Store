package com.bookstore.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class CartRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void addToCartRequest_rejectsNullQuantity() {
        Set<ConstraintViolation<AddToCartRequest>> violations =
                validator.validate(new AddToCartRequest(1L, null));

        assertThat(violations).anySatisfy(violation -> {
            assertThat(violation.getPropertyPath().toString()).isEqualTo("quantity");
            assertThat(violation.getMessage()).isEqualTo("Quantity is required");
        });
    }

    @Test
    void updateCartRequest_rejectsNullQuantity() {
        Set<ConstraintViolation<UpdateCartRequest>> violations =
                validator.validate(new UpdateCartRequest(null));

        assertThat(violations).anySatisfy(violation -> {
            assertThat(violation.getPropertyPath().toString()).isEqualTo("quantity");
            assertThat(violation.getMessage()).isEqualTo("Quantity is required");
        });
    }
}
