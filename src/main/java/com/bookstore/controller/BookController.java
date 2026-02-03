package com.bookstore.controller;

import com.bookstore.dto.BookDTO;
import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.mapper.BookMapper;
import com.bookstore.service.CategoryService;
import com.bookstore.service.BookService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final CategoryService categoryService;
    private final BookMapper bookMapper;

    public BookController(BookService bookService, CategoryService categoryService, BookMapper bookMapper) {
        this.bookService = bookService;
        this.categoryService = categoryService;
        this.bookMapper = bookMapper;
    }

    @GetMapping
    public ResponseEntity<Page<BookDTO>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<BookDTO> books = bookService.getAllBooks(pageable).map(bookMapper::toDTO);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) {
        Book book = bookService.getBookById(id);
        return ResponseEntity.ok(bookMapper.toDTO(book));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<BookDTO>> searchBooks(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BookDTO> books = bookService.searchBooks(keyword, pageable).map(bookMapper::toDTO);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<BookDTO>> getBooksByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Category category = categoryService.getCategoryById(categoryId);
        Page<BookDTO> books = bookService.getBooksByCategory(category, pageable).map(bookMapper::toDTO);
        return ResponseEntity.ok(books);
    }

    @PostMapping
    public ResponseEntity<BookDTO> createBook(@Valid @RequestBody BookDTO bookDTO) {
        Category category = resolveCategory(bookDTO.getCategoryId());
        Book book = bookMapper.toEntity(bookDTO, category);
        Book created = bookService.createBook(book);
        BookDTO createdDTO = bookMapper.toDTO(created);
        return new ResponseEntity<>(createdDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookDTO> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookDTO bookDTO) {
        Book existing = bookService.getBookById(id);
        Category category = resolveCategory(bookDTO.getCategoryId());
        bookMapper.updateEntity(existing, bookDTO, category);
        Book updated = bookService.updateBook(existing);
        return ResponseEntity.ok(bookMapper.toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryService.getCategoryById(categoryId);
    }
}
