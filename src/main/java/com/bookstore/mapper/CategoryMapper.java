package com.bookstore.mapper;

import com.bookstore.dto.CategoryDTO;
import com.bookstore.entity.Category;
import com.bookstore.domain.projection.CategoryWithCount;
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

    /**
     * Maps DTO to entity (name and description only). Used for create and update payloads.
     */
    public Category toEntity(CategoryDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return category;
    }
}
