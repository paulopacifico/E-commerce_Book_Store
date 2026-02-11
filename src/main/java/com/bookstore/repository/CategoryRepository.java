package com.bookstore.repository;

import com.bookstore.entity.Category;
import com.bookstore.repository.projection.CategoryWithBookCountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    boolean existsByName(String name);

    @Query("""
            SELECT c.id AS id, c.name AS name, c.description AS description, COUNT(b.id) AS bookCount
            FROM Category c
            LEFT JOIN c.books b
            GROUP BY c.id, c.name, c.description
            ORDER BY c.name
            """)
    List<CategoryWithBookCountProjection> findAllWithBookCount();

    @Query("""
            SELECT c.id AS id, c.name AS name, c.description AS description, COUNT(b.id) AS bookCount
            FROM Category c
            LEFT JOIN c.books b
            WHERE c.id = :id
            GROUP BY c.id, c.name, c.description
            """)
    Optional<CategoryWithBookCountProjection> findWithBookCountById(@Param("id") Long id);
}
