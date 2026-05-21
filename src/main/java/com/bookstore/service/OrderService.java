package com.bookstore.service;

import com.bookstore.entity.*;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.validation.OwnershipValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final BookRepository bookRepository;
    private final OwnershipValidator ownershipValidator;

    public OrderService(OrderRepository orderRepository,
            CartService cartService,
            BookRepository bookRepository,
            OwnershipValidator ownershipValidator) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.bookRepository = bookRepository;
        this.ownershipValidator = ownershipValidator;
    }

    @Transactional
    public Order checkout(User user, String shippingAddress) {
        List<CartItem> cartItems = cartService.getCartItems(user);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Create order
        Order order = Order.builder()
                .user(user)
                .shippingAddress(shippingAddress)
                .status(OrderStatus.CONFIRMED)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Create order items and update stock
        for (CartItem cartItem : cartItems) {
            Book book = cartItem.getBook();

            OrderItem orderItem = OrderItem.builder()
                    .book(book)
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(book.getPrice())
                    .build();

            order.addOrderItem(orderItem);

            totalAmount = totalAmount.add(orderItem.getSubtotal());

            decrementStock(book, cartItem.getQuantity());
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        // Clear the cart
        cartService.clearCart(user);

        return savedOrder;
    }

    private void decrementStock(Book book, int quantity) {
        int updatedRows = bookRepository.decrementStockIfAvailable(book.getId(), quantity);
        if (updatedRows == 0) {
            throw new BadRequestException("Not enough stock available for book: " + book.getTitle());
        }
    }

    public List<Order> getUserOrders(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .toList();
    }

    public Order getOrderById(User user, Long orderId) {
        Order order = orderRepository.findByIdWithOrderItemsAndBook(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        ownershipValidator.validateOrderOwnership(user, order);

        return order;
    }
}
