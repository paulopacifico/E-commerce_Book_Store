-- Sample Categories
INSERT INTO categories (id, name, description) VALUES (1, 'Fiction', 'Fiction and literature books');
INSERT INTO categories (id, name, description) VALUES (2, 'Non-Fiction', 'Non-fiction and educational books');
INSERT INTO categories (id, name, description) VALUES (3, 'Science Fiction', 'Sci-fi and fantasy books');
INSERT INTO categories (id, name, description) VALUES (4, 'Technology', 'Programming and tech books');

-- Sample Books
INSERT INTO books (id, title, author, isbn, description, price, stock_quantity, image_url, category_id, created_at, updated_at) 
VALUES (1, 'The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'A classic novel of the Jazz Age', 12.99, 50, 'https://example.com/gatsby.jpg', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO books (id, title, author, isbn, description, price, stock_quantity, image_url, category_id, created_at, updated_at) 
VALUES (2, 'To Kill a Mockingbird', 'Harper Lee', '978-0446310789', 'A masterpiece of modern American literature', 14.99, 35, 'https://example.com/mockingbird.jpg', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO books (id, title, author, isbn, description, price, stock_quantity, image_url, category_id, created_at, updated_at) 
VALUES (3, 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '978-0062316097', 'A brief history of our species', 18.99, 25, 'https://example.com/sapiens.jpg', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO books (id, title, author, isbn, description, price, stock_quantity, image_url, category_id, created_at, updated_at) 
VALUES (4, 'Dune', 'Frank Herbert', '978-0441172719', 'Epic science fiction masterpiece', 16.99, 40, 'https://example.com/dune.jpg', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO books (id, title, author, isbn, description, price, stock_quantity, image_url, category_id, created_at, updated_at) 
VALUES (5, 'Clean Code', 'Robert C. Martin', '978-0132350884', 'A handbook of agile software craftsmanship', 39.99, 20, 'https://example.com/cleancode.jpg', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Admin User (password: admin123)
INSERT INTO users (id, email, password, first_name, last_name, role, created_at, updated_at)
VALUES (1, 'admin@bookstore.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKqP/yU8xHEGjNJzT4kzW8mQqPHW', 'Admin', 'User', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Test User (password: user123)
INSERT INTO users (id, email, password, first_name, last_name, role, created_at, updated_at)
VALUES (2, 'user@test.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', 'Test', 'User', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
