package com.bookstore.controller;

import com.bookstore.dto.CheckoutRequest;
import com.bookstore.dto.OrderDTO;
import com.bookstore.entity.Order;
import com.bookstore.mapper.OrderMapper;
import com.bookstore.security.UserPrincipal;
import com.bookstore.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    public OrderController(OrderService orderService, OrderMapper orderMapper) {
        this.orderService = orderService;
        this.orderMapper = orderMapper;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderDTO> checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckoutRequest request) {
        Order order = orderService.checkout(principal.getUser(), request.getShippingAddress());
        return new ResponseEntity<>(orderMapper.toDTO(order), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderDTO> orders = orderService.getUserOrders(principal.getUser())
                .stream()
                .map(orderMapper::toDTO)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderId) {
        Order order = orderService.getOrderById(principal.getUser(), orderId);
        return ResponseEntity.ok(orderMapper.toDTO(order));
    }
}
