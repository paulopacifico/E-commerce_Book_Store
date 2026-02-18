package com.bookstore.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.bookstore.validation.NoHtml;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDTO {
    
    private Long id;
    
    @NotBlank(message = "Title is required")
    @NoHtml
    private String title;
    
    @NotBlank(message = "Author is required")
    @NoHtml
    private String author;
    
    @NoHtml
    private String isbn;
    
    @NoHtml
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;
    
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;
    
    @NoHtml
    private String imageUrl;
    
    private Long categoryId;
    
    @NoHtml
    private String categoryName;
}
