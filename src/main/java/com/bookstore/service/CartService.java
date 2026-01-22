package com.bookstore.service;

import com.bookstore.dto.AddToCartRequest;
import com.bookstore.dto.CartItemDTO;
import com.bookstore.dto.CartResponse;
import com.bookstore.entity.Book;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final BookService bookService;

    public CartResponse getCart(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());
        List<CartItemDTO> itemDTOs = cartItems.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        BigDecimal totalAmount = itemDTOs.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = itemDTOs.stream()
                .mapToInt(CartItemDTO::getQuantity)
                .sum();

        return CartResponse.builder()
                .items(itemDTOs)
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .build();
    }

    @Transactional
    public CartItemDTO addToCart(User user, AddToCartRequest request) {
        Book book = bookService.getBookEntity(request.getBookId());

        if (book.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Not enough stock available. Available: " + book.getStockQuantity());
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndBookId(user.getId(), book.getId());

        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            if (newQuantity > book.getStockQuantity()) {
                throw new BadRequestException(
                        "Total quantity exceeds available stock. Available: " + book.getStockQuantity());
            }
            cartItem.setQuantity(newQuantity);
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .book(book)
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        return mapToDTO(savedItem);
    }

    @Transactional
    public CartItemDTO updateCartItem(User user, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", "id", cartItemId));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Cart item does not belong to current user");
        }

        if (quantity > cartItem.getBook().getStockQuantity()) {
            throw new BadRequestException("Quantity exceeds available stock. Available: " +
                    cartItem.getBook().getStockQuantity());
        }

        cartItem.setQuantity(quantity);
        CartItem updatedItem = cartItemRepository.save(cartItem);
        return mapToDTO(updatedItem);
    }

    @Transactional
    public void removeFromCart(User user, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", "id", cartItemId));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Cart item does not belong to current user");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUserId(user.getId());
    }

    public List<CartItem> getCartItems(User user) {
        return cartItemRepository.findByUserId(user.getId());
    }

    private CartItemDTO mapToDTO(CartItem cartItem) {
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
