package com.bookstore.dto;

import jakarta.validation.constraints.NotBlank;
import com.bookstore.validation.NoHtml;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Shipping address is required")
    @NoHtml
    private String shippingAddress;
}
