package com.bookstore.validation;

import com.bookstore.entity.CartItem;
import com.bookstore.entity.Order;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import org.springframework.stereotype.Component;

@Component
public class OwnershipValidator {

    public void validateCartItemOwnership(User user, CartItem cartItem) {
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Cart item does not belong to current user");
        }
    }

    public void validateOrderOwnership(User user, Order order) {
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Order does not belong to current user");
        }
    }
}
