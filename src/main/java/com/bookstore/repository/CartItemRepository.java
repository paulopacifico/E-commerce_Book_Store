package com.bookstore.repository;

import com.bookstore.entity.CartItem;
import com.bookstore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);

    @Query("SELECT ci FROM CartItem ci JOIN FETCH ci.book WHERE ci.user.id = :userId")
    List<CartItem> findByUserId(@Param("userId") Long userId);

    Optional<CartItem> findByUserIdAndBookId(Long userId, Long bookId);

    void deleteByUserId(Long userId);

    void deleteByUserIdAndBookId(Long userId, Long bookId);
}
