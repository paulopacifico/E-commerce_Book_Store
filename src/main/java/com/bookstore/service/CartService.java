package com.bookstore.service;

import com.bookstore.domain.CartSummary;
import com.bookstore.entity.Book;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.User;
import com.bookstore.exception.ResourceNotFoundException;
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

    public CartService(CartItemRepository cartItemRepository,
            BookService bookService,
            StockValidator stockValidator,
            OwnershipValidator ownershipValidator) {
        this.cartItemRepository = cartItemRepository;
        this.bookService = bookService;
        this.stockValidator = stockValidator;
        this.ownershipValidator = ownershipValidator;
    }

    public CartSummary getCart(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());

        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getBook().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = cartItems.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return new CartSummary(cartItems, totalItems, totalAmount);
    }

    @Transactional
    public CartItem addToCart(User user, Long bookId, int quantity) {
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

        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public CartItem updateCartItem(User user, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", "id", cartItemId));

        ownershipValidator.validateCartItemOwnership(user, cartItem);

        stockValidator.validateTotalQuantity(cartItem.getBook(), quantity);

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
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
