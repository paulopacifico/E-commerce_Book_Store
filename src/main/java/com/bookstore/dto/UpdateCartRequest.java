package com.bookstore.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update cart item quantity")
public class UpdateCartRequest {

    @Min(value = 1, message = "Quantity must be at least 1")
    @Schema(description = "New quantity", requiredMode = Schema.RequiredMode.REQUIRED, example = "2")
    private Integer quantity;
}
