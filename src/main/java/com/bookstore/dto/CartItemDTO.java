package com.bookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Cart line item")
public class CartItemDTO {

    @Schema(description = "Cart item ID")
    private Long id;

    @NotNull(message = "Book ID is required")
    @Schema(description = "Book ID")
    private Long bookId;

    @Schema(description = "Book title")
    private String bookTitle;

    @Schema(description = "Book author")
    private String bookAuthor;

    @Schema(description = "Current book price")
    private BigDecimal bookPrice;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Schema(description = "Quantity in cart")
    private Integer quantity;

    @Schema(description = "Line subtotal")
    private BigDecimal subtotal;
}
