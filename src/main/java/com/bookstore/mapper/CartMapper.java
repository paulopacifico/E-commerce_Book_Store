package com.bookstore.mapper;

import com.bookstore.dto.CartItemDTO;
import com.bookstore.entity.Book;
import com.bookstore.entity.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class CartMapper {

    public CartItemDTO toDTO(CartItem cartItem) {
        Book book = cartItem.getBook();
        BigDecimal subtotal = book.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        return CartItemDTO.builder()
                .id(cartItem.getId())
                .bookId(book.getId())
                .bookTitle(book.getTitle())
                .bookAuthor(book.getAuthor())
                .bookPrice(book.getPrice())
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
