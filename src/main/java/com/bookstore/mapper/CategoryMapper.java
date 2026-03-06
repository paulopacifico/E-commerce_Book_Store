package com.bookstore.mapper;

import com.bookstore.dto.CategoryDTO;
import com.bookstore.entity.Category;
import com.bookstore.repository.CategoryWithCount;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDTO toDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .bookCount(category.getBooks() != null ? category.getBooks().size() : 0)
                .build();
    }

    public CategoryDTO toDTO(CategoryWithCount projection) {
        return CategoryDTO.builder()
                .id(projection.getId())
                .name(projection.getName())
                .description(projection.getDescription())
                .bookCount((int) projection.getBookCount())
                .build();
    }
}
