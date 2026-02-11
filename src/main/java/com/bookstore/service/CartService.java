package com.bookstore.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final BookService bookService;
    private final StockValidator stockValidator;
    private final OwnershipValidator ownershipValidator;
    private final CartMapper cartMapper;

    public CartService(CartItemRepository cartItemRepository,
            BookService bookService,
            StockValidator stockValidator,
            OwnershipValidator ownershipValidator,
            CartMapper cartMapper) {
        this.cartItemRepository = cartItemRepository;
        this.bookService = bookService;
        this.stockValidator = stockValidator;
        this.ownershipValidator = ownershipValidator;
        this.cartMapper = cartMapper;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());

        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getBook().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = cartItems.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return CartResponse.builder()
                .items(cartItems.stream().map(cartMapper::toDTO).toList())
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .build();
    }

    @Transactional
    public CartItemDTO addToCart(User user, Long bookId, int quantity) {
        Book book = bookService.getBookEntity(bookId);

        stockValidator.validateAvailableStock(book, quantity);

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndBookId(user.getId(), book.getId());

        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            stockValidator.validateTotalQuantity(book, newQuantity);
            cartItem.setQuantity(newQuantity);
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .book(book)
                    .quantity(quantity)
                    .build();
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return cartMapper.toDTO(saved);
    }

    @Transactional
    public CartItemDTO updateCartItem(User user, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", "id", cartItemId));

        ownershipValidator.validateCartItemOwnership(user, cartItem);

        stockValidator.validateTotalQuantity(cartItem.getBook(), quantity);

        cartItem.setQuantity(quantity);
        CartItem saved = cartItemRepository.save(cartItem);
        return cartMapper.toDTO(saved);
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

    @Transactional(readOnly = true)
    public List<CartItem> getCartItems(User user) {
        return cartItemRepository.findByUserId(user.getId());
    }
}
