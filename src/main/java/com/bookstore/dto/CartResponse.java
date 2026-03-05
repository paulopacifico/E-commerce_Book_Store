package com.bookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Shopping cart summary with items and totals")
public class CartResponse {

    @Schema(description = "Cart line items")
    private List<CartItemDTO> items;
    @Schema(description = "Total number of items")
    private int totalItems;
    @Schema(description = "Total cart amount")
    private BigDecimal totalAmount;
}
