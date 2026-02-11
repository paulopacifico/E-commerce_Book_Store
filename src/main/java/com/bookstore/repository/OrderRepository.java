package com.bookstore.repository;

import com.bookstore.entity.Order;
import com.bookstore.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"orderItems", "orderItems.book"})
    List<Order> findByUser(User user);

    Page<Order> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.book", "user"})
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Override
    @EntityGraph(attributePaths = {"orderItems", "orderItems.book", "user"})
    Optional<Order> findById(Long id);
}
