package com.bookstore.repository;

import com.bookstore.entity.Book;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class BookRepositoryIntegrationTest {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void decrementStockIfAvailable_updatesOnlyWhenStockIsSufficient() {
        Book book = bookRepository.findByIsbn("978-0132350884").orElseThrow();

        int updatedRows = bookRepository.decrementStockIfAvailable(book.getId(), 2);
        entityManager.clear();

        assertThat(updatedRows).isEqualTo(1);
        assertThat(bookRepository.findById(book.getId()).orElseThrow().getStockQuantity()).isEqualTo(18);
        assertThat(bookRepository.decrementStockIfAvailable(book.getId(), 19)).isZero();
    }
}
