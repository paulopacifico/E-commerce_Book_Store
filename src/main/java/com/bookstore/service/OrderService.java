package com.bookstore.service;

import com.bookstore.dto.CheckoutRequest;
import com.bookstore.dto.OrderDTO;
import com.bookstore.entity.*;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.mapper.OrderMapper;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.validation.OwnershipValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final BookRepository bookRepository;
    private final OrderMapper orderMapper;
    private final OwnershipValidator ownershipValidator;

    public OrderService(OrderRepository orderRepository,
            CartService cartService,
            BookRepository bookRepository,
            OrderMapper orderMapper,
            OwnershipValidator ownershipValidator) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.bookRepository = bookRepository;
        this.orderMapper = orderMapper;
        this.ownershipValidator = ownershipValidator;
    }

    @Transactional
    public OrderDTO checkout(User user, CheckoutRequest request) {
        List<CartItem> cartItems = cartService.getCartItems(user);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate stock availability
        for (CartItem item : cartItems) {
            Book book = item.getBook();
            if (book.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Not enough stock for '" + book.getTitle() +
                        "'. Available: " + book.getStockQuantity());
            }
        }

        // Create order
        Order order = Order.builder()
                .user(user)
                .shippingAddress(request.getShippingAddress())
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

            // Update stock
            book.setStockQuantity(book.getStockQuantity() - cartItem.getQuantity());
            bookRepository.save(book);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        // Clear the cart
        cartService.clearCart(user);

        return orderMapper.toDTO(savedOrder);
    }

    public List<OrderDTO> getUserOrders(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        ownershipValidator.validateOrderOwnership(user, order);

        return orderMapper.toDTO(order);
    }
}
