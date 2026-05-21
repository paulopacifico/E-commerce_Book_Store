package com.bookstore.service;

import com.bookstore.entity.Category;
import com.bookstore.exception.BadRequestException;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void deleteCategory_whenCategoryContainsBooks_rejectsDelete() {
        Category category = Category.builder().name("Technology").build();
        category.setId(4L);

        when(categoryRepository.findById(4L)).thenReturn(Optional.of(category));
        when(bookRepository.existsByCategoryId(4L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.deleteCategory(4L))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Category cannot be deleted while it contains books");

        verify(categoryRepository, never()).delete(category);
    }
}
