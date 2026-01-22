package com.bookstore.service;

import com.bookstore.dto.CategoryDTO;
import com.bookstore.entity.Category;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToDTO(category);
    }

    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByName(categoryDTO.getName())) {
            throw new BadRequestException("Category with name '" + categoryDTO.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(categoryDTO.getName())
                .description(categoryDTO.getDescription())
                .build();

        Category savedCategory = categoryRepository.save(category);
        return mapToDTO(savedCategory);
    }

    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (!category.getName().equals(categoryDTO.getName()) &&
                categoryRepository.existsByName(categoryDTO.getName())) {
            throw new BadRequestException("Category with name '" + categoryDTO.getName() + "' already exists");
        }

        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());

        Category updatedCategory = categoryRepository.save(category);
        return mapToDTO(updatedCategory);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }

    private CategoryDTO mapToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .bookCount(category.getBooks() != null ? category.getBooks().size() : 0)
                .build();
    }
}
