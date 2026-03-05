package com.bookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to add a book to the cart")
public class AddToCartRequest {

    @NotNull(message = "Book ID is required")
    @Schema(description = "Book ID to add", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long bookId;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Schema(description = "Quantity to add", example = "1")
    private Integer quantity = 1;
}
