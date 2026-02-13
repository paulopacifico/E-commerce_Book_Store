package com.bookstore.mapper;

import com.bookstore.dto.BookDTO;
import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class BookMapper {

    public BookDTO toDTO(Book book) {
        return BookDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .description(book.getDescription())
                .price(book.getPrice())
                .stockQuantity(book.getStockQuantity())
                .imageUrl(book.getImageUrl())
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .build();
    }

    public Book toEntity(BookDTO bookDTO, Category category) {
        return Book.builder()
                .title(bookDTO.getTitle())
                .author(bookDTO.getAuthor())
                .isbn(bookDTO.getIsbn())
                .description(bookDTO.getDescription())
                .price(bookDTO.getPrice())
                .stockQuantity(bookDTO.getStockQuantity() != null ? bookDTO.getStockQuantity() : 0)
                .imageUrl(bookDTO.getImageUrl())
                .category(category)
                .build();
    }

    public void updateEntity(Book book, BookDTO bookDTO, Category category) {
        book.setTitle(bookDTO.getTitle());
        book.setAuthor(bookDTO.getAuthor());
        book.setIsbn(bookDTO.getIsbn());
        book.setDescription(bookDTO.getDescription());
        book.setPrice(bookDTO.getPrice());
        book.setStockQuantity(bookDTO.getStockQuantity());
        book.setImageUrl(bookDTO.getImageUrl());

        if (category != null) {
            book.setCategory(category);
        }
    }
}
