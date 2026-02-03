package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderStatus;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.validation.OwnershipValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartService cartService;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private OwnershipValidator ownershipValidator;

    @InjectMocks
    private OrderService orderService;

    @Test
    void checkout_createsOrderUpdatesStockAndClearsCart() {
        User user = User.builder().build();
        user.setId(1L);
        Book book = Book.builder().price(BigDecimal.valueOf(25)).stockQuantity(10).build();
        book.setId(10L);
        CartItem item = CartItem.builder().user(user).book(book).quantity(2).build();
        item.setId(3L);

        when(cartService.getCartItems(user)).thenReturn(List.of(item));
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order order = inv.getArgument(0);
            order.setId(99L);
            return order;
        });

        Order result = orderService.checkout(user, "123 Main St");

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());
        Order savedOrder = orderCaptor.getValue();

        assertThat(savedOrder.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(savedOrder.getTotalAmount()).isEqualByComparingTo("50");
        assertThat(book.getStockQuantity()).isEqualTo(8);

        verify(cartService).clearCart(user);
        verify(bookRepository).save(book);
        assertThat(result).isNotNull();
    }
}
