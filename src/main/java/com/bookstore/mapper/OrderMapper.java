package com.bookstore.mapper;

import com.bookstore.dto.OrderDTO;
import com.bookstore.dto.OrderItemDTO;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderDTO toDTO(Order order) {
        List<OrderItemDTO> items = order.getOrderItems().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList());

        return OrderDTO.builder()
                .id(order.getId())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .build();
    }

    public OrderItemDTO toItemDTO(OrderItem orderItem) {
        return OrderItemDTO.builder()
                .id(orderItem.getId())
                .bookId(orderItem.getBook().getId())
                .bookTitle(orderItem.getBook().getTitle())
                .bookAuthor(orderItem.getBook().getAuthor())
                .quantity(orderItem.getQuantity())
                .priceAtPurchase(orderItem.getPriceAtPurchase())
                .subtotal(orderItem.getSubtotal())
                .build();
    }
}
