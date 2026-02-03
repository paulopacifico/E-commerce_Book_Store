package com.bookstore.security;

import com.bookstore.dto.BookDTO;
import com.bookstore.service.BookService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@Import(SecurityIntegrationTest.TestConfig.class)
class SecurityIntegrationTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Autowired
    private BookService bookService;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity())
                .build();
        objectMapper = new ObjectMapper();
    }

    @TestConfiguration
    static class TestConfig {
        @Bean
        BookService bookService() {
            return org.mockito.Mockito.mock(BookService.class);
        }

        @Bean
        JwtTokenProvider jwtTokenProvider() {
            return org.mockito.Mockito.mock(JwtTokenProvider.class);
        }

        @Bean
        UserDetailsService userDetailsService() {
            return org.mockito.Mockito.mock(UserDetailsService.class);
        }
    }

    @Test
    void getBooks_isPublic() throws Exception {
        when(bookService.getAllBooks(any())).thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 10), 0));

        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk());
    }

    @Test
    void createBook_requiresAuthentication() throws Exception {
        BookDTO request = BookDTO.builder()
                .title("Clean Architecture")
                .author("Robert C. Martin")
                .price(BigDecimal.valueOf(29.99))
                .stockQuantity(10)
                .build();

        mockMvc.perform(post("/api/books")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createBook_allowsAdmin() throws Exception {
        BookDTO request = BookDTO.builder()
                .title("Clean Architecture")
                .author("Robert C. Martin")
                .price(BigDecimal.valueOf(29.99))
                .stockQuantity(10)
                .build();

        BookDTO response = BookDTO.builder()
                .id(1L)
                .title(request.getTitle())
                .author(request.getAuthor())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .build();

        when(bookService.createBook(any(BookDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/books")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}
