package com.bookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Order data for API response")
public class OrderDTO {

    @Schema(description = "Unique order identifier")
    private Long id;
    @Schema(description = "Order line items")
    private List<OrderItemDTO> items;
    @Schema(description = "Total order amount")
    private BigDecimal totalAmount;
    @Schema(description = "Order status", example = "PENDING")
    private String status;
    @Schema(description = "Shipping address")
    private String shippingAddress;
    @Schema(description = "Order creation timestamp")
    private LocalDateTime createdAt;
}
