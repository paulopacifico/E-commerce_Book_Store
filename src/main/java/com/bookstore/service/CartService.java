package com.bookstore.service;

import com.bookstore.dto.AddToCartRequest;
import com.bookstore.dto.CartItemDTO;
import com.bookstore.dto.CartResponse;
import com.bookstore.entity.Book;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.User;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.mapper.CartMapper;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.validation.OwnershipValidator;
import com.bookstore.validation.StockValidator;
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
    private final CartMapper cartMapper;
    private final StockValidator stockValidator;
    private final OwnershipValidator ownershipValidator;

    public CartResponse getCart(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());
        List<CartItemDTO> itemDTOs = cartItems.stream()
                .map(cartMapper::toDTO)
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

        stockValidator.validateAvailableStock(book, request.getQuantity());

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndBookId(user.getId(), book.getId());

        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            stockValidator.validateTotalQuantity(book, newQuantity);
            cartItem.setQuantity(newQuantity);
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .book(book)
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        return cartMapper.toDTO(savedItem);
    }

    @Transactional
    public CartItemDTO updateCartItem(User user, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", "id", cartItemId));

        ownershipValidator.validateCartItemOwnership(user, cartItem);

        stockValidator.validateTotalQuantity(cartItem.getBook(), quantity);

        cartItem.setQuantity(quantity);
        CartItem updatedItem = cartItemRepository.save(cartItem);
        return cartMapper.toDTO(updatedItem);
    }

    @Transactional
    public void removeFromCart(User user, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", "id", cartItemId));

        ownershipValidator.validateCartItemOwnership(user, cartItem);

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUserId(user.getId());
    }

    public List<CartItem> getCartItems(User user) {
        return cartItemRepository.findByUserId(user.getId());
    }
}
