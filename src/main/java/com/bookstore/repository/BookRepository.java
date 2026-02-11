package com.bookstore.repository;

import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    @Override
    @EntityGraph(attributePaths = "category")
    Page<Book> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "category")
    Optional<Book> findById(Long id);

    @EntityGraph(attributePaths = "category")
    Page<Book> findByCategory(Category category, Pageable pageable);

    @EntityGraph(attributePaths = "category")
    Page<Book> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE " +
            "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    @EntityGraph(attributePaths = "category")
    Page<Book> searchByTitleOrAuthor(@Param("keyword") String keyword, Pageable pageable);

    Optional<Book> findByIsbn(String isbn);

    List<Book> findByCategoryId(Long categoryId);

    @Query("SELECT b FROM Book b WHERE b.stockQuantity > 0")
    Page<Book> findAvailableBooks(Pageable pageable);
}
