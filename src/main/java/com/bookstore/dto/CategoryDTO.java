package com.bookstore.dto;

import jakarta.validation.constraints.NotBlank;
import com.bookstore.validation.NoHtml;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {

    private Long id;

    @NotBlank(message = "Category name is required")
    @NoHtml
    private String name;

    @NoHtml
    private String description;

    private int bookCount;
}
