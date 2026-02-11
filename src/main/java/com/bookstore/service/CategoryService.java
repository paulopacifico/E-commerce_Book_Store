package com.bookstore.service;

import com.bookstore.dto.CategoryDTO;
import com.bookstore.entity.Category;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.mapper.CategoryMapper;
import com.bookstore.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAllWithBookCount()
                .stream()
                .map(categoryMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        return categoryRepository.findWithBookCountById(id)
                .map(categoryMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = categoryMapper.toEntity(categoryDTO);

        if (categoryRepository.existsByName(category.getName())) {
            throw new BadRequestException("Category with name '" + category.getName() + "' already exists");
        }

        Category created = categoryRepository.save(category);
        return categoryMapper.toDTO(created, 0);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = getCategoryEntity(id);

        if (!category.getName().equals(categoryDTO.getName()) &&
                categoryRepository.existsByName(categoryDTO.getName())) {
            throw new BadRequestException("Category with name '" + categoryDTO.getName() + "' already exists");
        }

        categoryMapper.updateEntity(category, categoryDTO);
        categoryRepository.save(category);

        return categoryRepository.findWithBookCountById(id)
                .map(categoryMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.delete(getCategoryEntity(id));
    }

    @Transactional(readOnly = true)
    public Category getCategoryEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }
}
