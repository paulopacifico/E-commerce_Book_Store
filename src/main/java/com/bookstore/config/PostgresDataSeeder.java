package com.bookstore.config;

import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@Profile("docker")
public class PostgresDataSeeder implements ApplicationRunner {

    private static final String ADMIN_EMAIL = "admin@bookstore.com";
    private static final String USER_EMAIL = "user@test.com";

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public PostgresDataSeeder(CategoryRepository categoryRepository,
            BookRepository bookRepository,
            UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Category fiction = upsertCategory("Fiction", "Fiction and literature books");
        Category nonFiction = upsertCategory("Non-Fiction", "Non-fiction and educational books");
        Category sciFi = upsertCategory("Science Fiction", "Sci-fi and fantasy books");
        Category technology = upsertCategory("Technology", "Programming and tech books");

        upsertBook("978-0743273565", "The Great Gatsby", "F. Scott Fitzgerald",
                "A classic novel of the Jazz Age", BigDecimal.valueOf(12.99), 50, fiction);
        upsertBook("978-0446310789", "To Kill a Mockingbird", "Harper Lee",
                "A masterpiece of modern American literature", BigDecimal.valueOf(14.99), 35, fiction);
        upsertBook("978-0062316097", "Sapiens: A Brief History of Humankind", "Yuval Noah Harari",
                "A brief history of our species", BigDecimal.valueOf(18.99), 25, nonFiction);
        upsertBook("978-0441172719", "Dune", "Frank Herbert",
                "Epic science fiction masterpiece", BigDecimal.valueOf(16.99), 40, sciFi);
        upsertBook("978-0132350884", "Clean Code", "Robert C. Martin",
                "A handbook of agile software craftsmanship", BigDecimal.valueOf(39.99), 20, technology);

        upsertUser(ADMIN_EMAIL, "Admin", "User", Role.ADMIN,
                "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKqP/yU8xHEGjNJzT4kzW8mQqPHW");
        upsertUser(USER_EMAIL, "Test", "User", Role.USER,
                "$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG");
    }

    private Category upsertCategory(String name, String description) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> {
                    Category category = Category.builder()
                            .name(name)
                            .description(description)
                            .build();
                    return categoryRepository.save(category);
                });
    }

    private void upsertBook(String isbn,
            String title,
            String author,
            String description,
            BigDecimal price,
            int stock,
            Category category) {
        if (bookRepository.findByIsbn(isbn).isPresent()) {
            return;
        }
        Book book = Book.builder()
                .isbn(isbn)
                .title(title)
                .author(author)
                .description(description)
                .price(price)
                .stockQuantity(stock)
                .category(category)
                .imageUrl("https://example.com/" + title.toLowerCase().replace(" ", "-") + ".jpg")
                .build();
        bookRepository.save(book);
    }

    private void upsertUser(String email, String firstName, String lastName, Role role, String encodedPassword) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = User.builder()
                .email(email)
                .password(encodedPassword)
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .build();
        userRepository.save(user);
    }
}
