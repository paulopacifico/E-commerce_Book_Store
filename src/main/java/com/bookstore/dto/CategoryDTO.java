package com.bookstore.dto;

import com.bookstore.validation.NoHtml;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Book category for API request/response")
public class CategoryDTO {

    @Schema(description = "Unique category identifier", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotBlank(message = "Category name is required")
    @NoHtml
    @Schema(description = "Category name", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @NoHtml
    @Schema(description = "Category description")
    private String description;

    @Schema(description = "Number of books in this category", accessMode = Schema.AccessMode.READ_ONLY)
    private int bookCount;
}
