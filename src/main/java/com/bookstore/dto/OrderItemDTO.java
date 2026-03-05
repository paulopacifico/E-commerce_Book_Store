package com.bookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Order line item")
public class OrderItemDTO {

    @Schema(description = "Line item ID")
    private Long id;
    @Schema(description = "Book ID")
    private Long bookId;
    @Schema(description = "Book title at time of order")
    private String bookTitle;
    @Schema(description = "Book author at time of order")
    private String bookAuthor;
    @Schema(description = "Quantity ordered")
    private Integer quantity;
    @Schema(description = "Unit price at purchase")
    private BigDecimal priceAtPurchase;
    @Schema(description = "Line subtotal (quantity × price)")
    private BigDecimal subtotal;
}
