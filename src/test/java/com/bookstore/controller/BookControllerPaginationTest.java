package com.bookstore.controller;

import com.bookstore.exception.GlobalExceptionHandler;
import com.bookstore.mapper.BookMapper;
import com.bookstore.service.AuditLogger;
import com.bookstore.service.BookService;
import com.bookstore.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BookControllerPaginationTest {

    private MockMvc mockMvc;
    private BookService bookService;
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        bookService = mock(BookService.class);
        categoryService = mock(CategoryService.class);
        BookController controller = new BookController(
                bookService,
                categoryService,
                mock(BookMapper.class),
                mock(AuditLogger.class));
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler(new MockEnvironment()))
                .build();
    }

    @Test
    void getAllBooks_rejectsUnsupportedSortField() throws Exception {
        mockMvc.perform(get("/api/books").param("sortBy", "category.books"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid book sort field: category.books"));

        verifyNoInteractions(bookService);
    }

    @Test
    void getAllBooks_rejectsUnsupportedSortDirection() throws Exception {
        mockMvc.perform(get("/api/books").param("sortDir", "sideways"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Sort direction must be 'asc' or 'desc'"));

        verifyNoInteractions(bookService);
    }

    @Test
    void searchBooks_rejectsPageSizesAboveLimit() throws Exception {
        mockMvc.perform(get("/api/books/search")
                        .param("keyword", "clean")
                        .param("size", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Page size must be between 1 and 100"));

        verifyNoInteractions(bookService);
    }

    @Test
    void getBooksByCategory_rejectsNegativePageBeforeCategoryLookup() throws Exception {
        mockMvc.perform(get("/api/books/category/4").param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Page index must be 0 or greater"));

        verifyNoInteractions(bookService, categoryService);
    }
}
