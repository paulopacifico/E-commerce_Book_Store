package com.bookstore.domain;

import com.bookstore.entity.CartItem;

import java.math.BigDecimal;
import java.util.List;

public class CartSummary {

    private final List<CartItem> items;
    private final int totalItems;
    private final BigDecimal totalAmount;

    public CartSummary(List<CartItem> items, int totalItems, BigDecimal totalAmount) {
        this.items = items;
        this.totalItems = totalItems;
        this.totalAmount = totalAmount;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
}
