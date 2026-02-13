package com.bookstore.validation;

import com.bookstore.entity.Book;
import com.bookstore.exception.BadRequestException;
import org.springframework.stereotype.Component;

@Component
public class StockValidator {

    public void validateAvailableStock(Book book, int requestedQuantity) {
        if (book.getStockQuantity() < requestedQuantity) {
            throw new BadRequestException("Not enough stock available. Available: " + book.getStockQuantity());
        }
    }

    public void validateTotalQuantity(Book book, int totalQuantity) {
        if (totalQuantity > book.getStockQuantity()) {
            throw new BadRequestException(
                    "Total quantity exceeds available stock. Available: " + book.getStockQuantity());
        }
    }
}
