package com.bookstore.dto;

import com.bookstore.validation.NoHtml;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Checkout request with shipping address")
public class CheckoutRequest {

    @NotBlank(message = "Shipping address is required")
    @NoHtml
    @Schema(description = "Shipping address for the order", requiredMode = Schema.RequiredMode.REQUIRED)
    private String shippingAddress;
}
