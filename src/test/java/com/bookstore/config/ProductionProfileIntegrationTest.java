package com.bookstore.config;

import com.bookstore.repository.BookRepository;
import com.bookstore.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:prod-profile;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "jwt.secret=prodProfileJwtSecretThatIsLongEnoughForHs256Signing",
        "app.security.cors.allowed-origins[0]=https://bookstore.example"
})
@ActiveProfiles("prod")
class ProductionProfileIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Test
    void prodProfileUsesFlywaySchemaWithoutLocalSeedData() {
        assertThat(userRepository.count()).isZero();
        assertThat(bookRepository.count()).isZero();
    }
}
