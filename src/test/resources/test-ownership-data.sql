-- Order belonging to user 1 (admin). Used to test 403 when user 2 tries to access it.
INSERT INTO orders (id, user_id, total_amount, status, shipping_address, created_at, updated_at)
VALUES (1, 1, 12.99, 'CONFIRMED', 'Admin Address', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO order_items (id, order_id, book_id, quantity, price_at_purchase)
VALUES (1, 1, 1, 1, 12.99);

-- Cart item belonging to user 1 (admin). Used to test 403 when user 2 tries to update/remove it.
INSERT INTO cart_items (id, user_id, book_id, quantity)
VALUES (1, 1, 1, 1);
