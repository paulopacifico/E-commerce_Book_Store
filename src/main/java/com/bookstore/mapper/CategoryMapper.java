package com.bookstore.mapper;

import com.bookstore.dto.CategoryDTO;
import com.bookstore.entity.Category;
import com.bookstore.repository.projection.CategoryWithBookCountProjection;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDTO toDTO(Category category, int bookCount) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .bookCount(bookCount)
                .build();
    }

    public CategoryDTO toDTO(CategoryWithBookCountProjection projection) {
        return CategoryDTO.builder()
                .id(projection.getId())
                .name(projection.getName())
                .description(projection.getDescription())
                .bookCount(Math.toIntExact(projection.getBookCount()))
                .build();
    }

    public Category toEntity(CategoryDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return category;
    }

    public void updateEntity(Category category, CategoryDTO dto) {
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
    }
}
