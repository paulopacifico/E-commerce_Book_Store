package com.bookstore.controller;

import com.bookstore.dto.CategoryDTO;
import com.bookstore.entity.Category;
import com.bookstore.mapper.CategoryMapper;
import com.bookstore.service.AuditLogger;
import com.bookstore.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;
    private final AuditLogger auditLogger;

    public CategoryController(CategoryService categoryService, CategoryMapper categoryMapper, AuditLogger auditLogger) {
        this.categoryService = categoryService;
        this.categoryMapper = categoryMapper;
        this.auditLogger = auditLogger;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories()
                .stream()
                .map(categoryMapper::toDTO)
                .toList();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(categoryMapper.toDTO(category));
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO,
            Authentication authentication) {
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        Category created = categoryService.createCategory(category);
        auditLogger.log("CATEGORY_CREATE", authentication.getName(), "CATEGORY", "SUCCESS", "categoryId=" + created.getId());
        return new ResponseEntity<>(categoryMapper.toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO categoryDTO,
            Authentication authentication) {
        Category updates = new Category();
        updates.setName(categoryDTO.getName());
        updates.setDescription(categoryDTO.getDescription());
        Category updated = categoryService.updateCategory(id, updates);
        auditLogger.log("CATEGORY_UPDATE", authentication.getName(), "CATEGORY", "SUCCESS", "categoryId=" + id);
        return ResponseEntity.ok(categoryMapper.toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, Authentication authentication) {
        categoryService.deleteCategory(id);
        auditLogger.log("CATEGORY_DELETE", authentication.getName(), "CATEGORY", "SUCCESS", "categoryId=" + id);
        return ResponseEntity.noContent().build();
    }
}
