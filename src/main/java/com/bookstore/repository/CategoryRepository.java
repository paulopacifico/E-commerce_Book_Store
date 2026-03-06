package com.bookstore.repository;

import com.bookstore.entity.Category;
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

    @Query("SELECT c.id as id, c.name as name, c.description as description, " +
            "(SELECT COUNT(b) FROM Book b WHERE b.category = c) as bookCount FROM Category c")
    List<CategoryWithCount> findAllWithBookCount();

    @Query("SELECT c.id as id, c.name as name, c.description as description, " +
            "(SELECT COUNT(b) FROM Book b WHERE b.category = c) as bookCount FROM Category c WHERE c.id = :id")
    Optional<CategoryWithCount> findByIdWithBookCount(@Param("id") Long id);
}
