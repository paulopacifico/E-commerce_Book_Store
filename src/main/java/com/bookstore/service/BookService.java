package com.bookstore.service;

import com.bookstore.dto.BookDTO;
import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.mapper.BookMapper;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final BookMapper bookMapper;

    public BookService(BookRepository bookRepository,
            CategoryRepository categoryRepository,
            BookMapper bookMapper) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
        this.bookMapper = bookMapper;
    }

    @Transactional(readOnly = true)
    public Page<BookDTO> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable).map(bookMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public BookDTO getBookById(Long id) {
        return bookMapper.toDTO(getBookEntity(id));
    }

    @Transactional(readOnly = true)
    public Page<BookDTO> searchBooks(String keyword, Pageable pageable) {
        return bookRepository.searchByTitleOrAuthor(keyword, pageable).map(bookMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<BookDTO> getBooksByCategory(Long categoryId, Pageable pageable) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category", "id", categoryId);
        }
        return bookRepository.findByCategoryId(categoryId, pageable).map(bookMapper::toDTO);
    }

    @Transactional
    public BookDTO createBook(BookDTO bookDTO) {
        Category category = resolveCategory(bookDTO.getCategoryId());
        Book book = bookMapper.toEntity(bookDTO, category);
        Book created = bookRepository.save(book);
        return bookMapper.toDTO(created);
    }

    @Transactional
    public BookDTO updateBook(Long id, BookDTO bookDTO) {
        Book existing = getBookEntity(id);
        Category category = resolveCategory(bookDTO.getCategoryId());
        bookMapper.updateEntity(existing, bookDTO, category);
        Book updated = bookRepository.save(existing);
        return bookMapper.toDTO(updated);
    }

    @Transactional
    public void deleteBook(Long id) {
        bookRepository.delete(getBookEntity(id));
    }

    @Transactional(readOnly = true)
    public Book getBookEntity(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
    }
}
