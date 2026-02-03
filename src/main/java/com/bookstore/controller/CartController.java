package com.bookstore.controller;

import com.bookstore.dto.AddToCartRequest;
import com.bookstore.dto.CartItemDTO;
import com.bookstore.dto.CartResponse;
import com.bookstore.dto.UpdateCartRequest;
import com.bookstore.security.UserPrincipal;
import com.bookstore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getUser()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request) {
        CartItemDTO cartItem = cartService.addToCart(principal.getUser(), request);
        return new ResponseEntity<>(cartItem, HttpStatus.CREATED);
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<CartItemDTO> updateCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartRequest request) {
        return ResponseEntity.ok(cartService.updateCartItem(principal.getUser(), cartItemId, request.getQuantity()));
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
