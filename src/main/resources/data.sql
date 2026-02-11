-- Sample categories (idempotent, no fixed IDs)
INSERT INTO categories (name, description)
SELECT 'Fiction', 'Fiction and literature books'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Fiction');

INSERT INTO categories (name, description)
SELECT 'Non-Fiction', 'Non-fiction and educational books'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Non-Fiction');

INSERT INTO categories (name, description)
SELECT 'Science Fiction', 'Sci-fi and fantasy books'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Science Fiction');

INSERT INTO categories (name, description)
SELECT 'Technology', 'Programming and tech books'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Technology');

-- Sample books (idempotent by ISBN, category resolved by name)
INSERT INTO books (title, author, isbn, description, price, stock_quantity, image_url, category_id, created_at, updated_at)
SELECT
    'The Great Gatsby',
    'F. Scott Fitzgerald',
    '978-0743273565',
    'A classic novel of the Jazz Age',
    12.99,
    50,
    'https://example.com/gatsby.jpg',
    (SELECT c.id FROM categories c WHERE c.name = 'Fiction'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0743273565');

INSERT INTO books (title, author, isbn, description, price, stock_quantity, image_url, category_id, created_at, updated_at)
SELECT
    'To Kill a Mockingbird',
    'Harper Lee',
    '978-0446310789',
    'A masterpiece of modern American literature',
    14.99,
    35,
    'https://example.com/mockingbird.jpg',
    (SELECT c.id FROM categories c WHERE c.name = 'Fiction'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0446310789');

INSERT INTO books (title, author, isbn, description, price, stock_quantity, image_url, category_id, created_at, updated_at)
SELECT
    'Sapiens: A Brief History of Humankind',
    'Yuval Noah Harari',
    '978-0062316097',
    'A brief history of our species',
    18.99,
    25,
    'https://example.com/sapiens.jpg',
    (SELECT c.id FROM categories c WHERE c.name = 'Non-Fiction'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0062316097');

INSERT INTO books (title, author, isbn, description, price, stock_quantity, image_url, category_id, created_at, updated_at)
SELECT
    'Dune',
    'Frank Herbert',
    '978-0441172719',
    'Epic science fiction masterpiece',
    16.99,
    40,
    'https://example.com/dune.jpg',
    (SELECT c.id FROM categories c WHERE c.name = 'Science Fiction'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0441172719');

INSERT INTO books (title, author, isbn, description, price, stock_quantity, image_url, category_id, created_at, updated_at)
SELECT
    'Clean Code',
    'Robert C. Martin',
    '978-0132350884',
    'A handbook of agile software craftsmanship',
    39.99,
    20,
    'https://example.com/cleancode.jpg',
    (SELECT c.id FROM categories c WHERE c.name = 'Technology'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0132350884');

-- Admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at)
SELECT
    'admin@bookstore.com',
    '$2y$10$KHBGhWKKIk0Dvb.4qSfrk.92tjZCdpgQcLuTnjsKtmBC9q91g/PdC',
    'Admin',
    'User',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@bookstore.com');

-- Test user (password: user123)
INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at)
SELECT
    'user@test.com',
    '$2y$10$HLgHalxJtyeyMWerIqvP8OZdY1vVu8LTAA8Nre0gmCY2SXRG/drCO',
    'Test',
    'User',
    'USER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@test.com');
