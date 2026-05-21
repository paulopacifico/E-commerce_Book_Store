package com.bookstore.controller;

import com.bookstore.dto.BookDTO;
import com.bookstore.dto.PageResponse;
import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.exception.BadRequestException;
import com.bookstore.mapper.BookMapper;
import com.bookstore.service.CategoryService;
import com.bookstore.service.BookService;
import com.bookstore.service.AuditLogger;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Set;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> SORTABLE_BOOK_FIELDS = Set.of(
            "title", "author", "price", "stockQuantity", "createdAt");

    private final BookService bookService;
    private final CategoryService categoryService;
    private final BookMapper bookMapper;
    private final AuditLogger auditLogger;

    public BookController(BookService bookService,
            CategoryService categoryService,
            BookMapper bookMapper,
            AuditLogger auditLogger) {
        this.bookService = bookService;
        this.categoryService = categoryService;
        this.bookMapper = bookMapper;
        this.auditLogger = auditLogger;
    }

    @Operation(summary = "List all books", description = "Returns a paginated list of all books with optional sorting.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Success"),
            @ApiResponse(responseCode = "400", description = "Invalid pagination or sorting parameters", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(hidden = true)))
    })
    @GetMapping
    public ResponseEntity<PageResponse<BookDTO>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Pageable pageable = bookPageRequest(page, size, sortBy, sortDir);

        Page<BookDTO> books = bookService.getAllBooks(pageable).map(bookMapper::toDTO);
        return ResponseEntity.ok(PageResponse.from(books));
    }

    @Operation(summary = "Get book by ID", description = "Returns a single book by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Success"),
            @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(hidden = true)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) {
        Book book = bookService.getBookById(id);
        return ResponseEntity.ok(bookMapper.toDTO(book));
    }

    @Operation(summary = "Search books", description = "Searches books by keyword (title, author, description) with pagination.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Success"),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(hidden = true)))
    })
    @GetMapping("/search")
    public ResponseEntity<PageResponse<BookDTO>> searchBooks(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = pageRequest(page, size);
        Page<BookDTO> books = bookService.searchBooks(keyword, pageable).map(bookMapper::toDTO);
        return ResponseEntity.ok(PageResponse.from(books));
    }

    @Operation(summary = "List books by category", description = "Returns a paginated list of books for the given category ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Success"),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(hidden = true)))
    })
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<PageResponse<BookDTO>> getBooksByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = pageRequest(page, size);
        Category category = categoryService.getCategoryById(categoryId);
        Page<BookDTO> books = bookService.getBooksByCategory(category, pageable).map(bookMapper::toDTO);
        return ResponseEntity.ok(PageResponse.from(books));
    }

    @Operation(summary = "Create book", description = "Creates a new book. Requires admin role.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Book created"),
            @ApiResponse(responseCode = "400", description = "Validation error", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(hidden = true)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<BookDTO> createBook(@Valid @RequestBody BookDTO bookDTO, Authentication authentication) {
        Category category = resolveCategory(bookDTO.getCategoryId());
        Book book = bookMapper.toEntity(bookDTO, category);
        Book created = bookService.createBook(book);
        BookDTO createdDTO = bookMapper.toDTO(created);
        auditLogger.log("BOOK_CREATE", authentication.getName(), "BOOK", "SUCCESS", "bookId=" + createdDTO.getId());
        return new ResponseEntity<>(createdDTO, HttpStatus.CREATED);
    }

    @Operation(summary = "Update book", description = "Updates an existing book by ID. Requires admin role.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Book updated"),
            @ApiResponse(responseCode = "400", description = "Validation error", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(hidden = true)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}")
    public ResponseEntity<BookDTO> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookDTO bookDTO,
            Authentication authentication) {
        Book existing = bookService.getBookById(id);
        Category category = resolveCategory(bookDTO.getCategoryId());
        bookMapper.updateEntity(existing, bookDTO, category);
        Book updated = bookService.updateBook(existing);
        auditLogger.log("BOOK_UPDATE", authentication.getName(), "BOOK", "SUCCESS", "bookId=" + id);
        return ResponseEntity.ok(bookMapper.toDTO(updated));
    }

    @Operation(summary = "Delete book", description = "Deletes a book by ID. Requires admin role.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Book deleted"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "404", description = "Book not found", content = @Content(schema = @Schema(hidden = true)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id, Authentication authentication) {
        bookService.deleteBook(id);
        auditLogger.log("BOOK_DELETE", authentication.getName(), "BOOK", "SUCCESS", "bookId=" + id);
        return ResponseEntity.noContent().build();
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryService.getCategoryById(categoryId);
    }

    private Pageable bookPageRequest(int page, int size, String sortBy, String sortDir) {
        validatePageRequest(page, size);
        if (!SORTABLE_BOOK_FIELDS.contains(sortBy)) {
            throw new BadRequestException("Invalid book sort field: " + sortBy);
        }

        Sort sort = switch (sortDir.toLowerCase(Locale.ROOT)) {
            case "asc" -> Sort.by(sortBy).ascending();
            case "desc" -> Sort.by(sortBy).descending();
            default -> throw new BadRequestException("Sort direction must be 'asc' or 'desc'");
        };

        return PageRequest.of(page, size, sort);
    }

    private Pageable pageRequest(int page, int size) {
        validatePageRequest(page, size);
        return PageRequest.of(page, size);
    }

    private void validatePageRequest(int page, int size) {
        if (page < 0) {
            throw new BadRequestException("Page index must be 0 or greater");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page size must be between 1 and " + MAX_PAGE_SIZE);
        }
    }
}
