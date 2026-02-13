package com.bookstore.controller;

import com.bookstore.dto.AddToCartRequest;
import com.bookstore.dto.CartItemDTO;
import com.bookstore.dto.CartResponse;
import com.bookstore.dto.UpdateCartRequest;
import com.bookstore.domain.CartSummary;
import com.bookstore.security.UserPrincipal;
import com.bookstore.service.CartService;
import com.bookstore.mapper.CartMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final CartMapper cartMapper;

    public CartController(CartService cartService, CartMapper cartMapper) {
        this.cartService = cartService;
        this.cartMapper = cartMapper;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        CartSummary summary = cartService.getCart(principal.getUser());
        CartResponse response = CartResponse.builder()
                .items(summary.getItems().stream().map(cartMapper::toDTO).toList())
                .totalItems(summary.getTotalItems())
                .totalAmount(summary.getTotalAmount())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request) {
        CartItemDTO cartItem = cartMapper.toDTO(
                cartService.addToCart(principal.getUser(), request.getBookId(), request.getQuantity()));
        return new ResponseEntity<>(cartItem, HttpStatus.CREATED);
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<CartItemDTO> updateCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartRequest request) {
        CartItemDTO cartItem = cartMapper.toDTO(
                cartService.updateCartItem(principal.getUser(), cartItemId, request.getQuantity()));
        return ResponseEntity.ok(cartItem);
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long cartItemId) {
        cartService.removeFromCart(principal.getUser(), cartItemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getUser());
        return ResponseEntity.noContent().build();
    }
}
