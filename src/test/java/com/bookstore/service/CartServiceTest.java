package com.bookstore.service;

import com.bookstore.dto.CartItemDTO;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.Book;
import com.bookstore.entity.User;
import com.bookstore.mapper.CartMapper;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.validation.OwnershipValidator;
import com.bookstore.validation.StockValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private BookService bookService;

    @Mock
    private StockValidator stockValidator;

    @Mock
    private OwnershipValidator ownershipValidator;

    @Mock
    private CartMapper cartMapper;

    @InjectMocks
    private CartService cartService;

    @Test
    void addToCart_mergesExistingItemAndValidatesStock() {
        User user = User.builder().build();
        user.setId(1L);
        Book book = Book.builder().price(BigDecimal.valueOf(20)).stockQuantity(10).build();
        book.setId(10L);
        CartItem existing = CartItem.builder().user(user).book(book).quantity(2).build();
        existing.setId(5L);

        when(bookService.getBookEntity(10L)).thenReturn(book);
        when(cartItemRepository.findByUserIdAndBookId(1L, 10L)).thenReturn(Optional.of(existing));
        CartItemDTO mapped = CartItemDTO.builder().id(5L).quantity(5).build();
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(cartMapper.toDTO(any(CartItem.class))).thenReturn(mapped);

        CartItemDTO result = cartService.addToCart(user, 10L, 3);

        verify(stockValidator).validateAvailableStock(book, 3);
        verify(stockValidator).validateTotalQuantity(book, 5);
        ArgumentCaptor<CartItem> captor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(captor.capture());
        assertThat(captor.getValue().getQuantity()).isEqualTo(5);
        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(5);
    }

    @Test
    void updateCartItem_validatesOwnershipAndStock() {
        User user = User.builder().build();
        user.setId(1L);
        Book book = Book.builder().price(BigDecimal.valueOf(20)).stockQuantity(10).build();
        book.setId(10L);
        CartItem item = CartItem.builder().user(user).book(book).quantity(2).build();
        item.setId(5L);

        when(cartItemRepository.findById(5L)).thenReturn(Optional.of(item));
        CartItemDTO mapped = CartItemDTO.builder().id(5L).quantity(4).build();
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(cartMapper.toDTO(any(CartItem.class))).thenReturn(mapped);

        CartItemDTO result = cartService.updateCartItem(user, 5L, 4);

        verify(ownershipValidator).validateCartItemOwnership(user, item);
        verify(stockValidator).validateTotalQuantity(book, 4);
        verify(cartItemRepository).save(item);
        assertThat(item.getQuantity()).isEqualTo(4);
        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(4);
    }
}
