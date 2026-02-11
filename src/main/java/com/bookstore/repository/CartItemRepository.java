package com.bookstore.repository;

import com.bookstore.entity.CartItem;
import com.bookstore.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @EntityGraph(attributePaths = "book")
    List<CartItem> findByUser(User user);

    @EntityGraph(attributePaths = "book")
    List<CartItem> findByUserId(Long userId);

    @EntityGraph(attributePaths = "book")
    Optional<CartItem> findByUserIdAndBookId(Long userId, Long bookId);

    @Override
    @EntityGraph(attributePaths = {"book", "user"})
    Optional<CartItem> findById(Long id);

    void deleteByUserId(Long userId);

    void deleteByUserIdAndBookId(Long userId, Long bookId);
}
