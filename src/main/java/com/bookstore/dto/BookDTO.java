package com.bookstore.dto;

import com.bookstore.validation.NoHtml;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Book data for API request/response")
public class BookDTO {

    @Schema(description = "Unique book identifier", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotBlank(message = "Title is required")
    @NoHtml
    @Schema(description = "Book title", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @NotBlank(message = "Author is required")
    @NoHtml
    @Schema(description = "Book author", requiredMode = Schema.RequiredMode.REQUIRED)
    private String author;

    @NoHtml
    @Schema(description = "International Standard Book Number")
    private String isbn;

    @NoHtml
    @Schema(description = "Book description")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Schema(description = "Unit price", requiredMode = Schema.RequiredMode.REQUIRED, example = "29.99")
    private BigDecimal price;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Schema(description = "Available stock quantity", example = "10")
    private Integer stockQuantity;

    @NoHtml
    @Schema(description = "URL of the book cover image")
    private String imageUrl;

    @Schema(description = "Category ID this book belongs to")
    private Long categoryId;

    @NoHtml
    @Schema(description = "Category name (read-only)", accessMode = Schema.AccessMode.READ_ONLY)
    private String categoryName;
}
