# 📚 E-Commerce Book Store API

## Professional Overview
This project represents a robust backend solution for a digital bookstore, engineered to handle secure transactions and inventory management. Built with modern **Java 21** and **Spring Boot 4**, it demonstrates enterprise-grade architectural patterns common in the Canadian tech landscape.

The application focuses on **security**, **scalability**, and **clean code principles**, utilizing JWT for stateless authentication and JPA for efficient data abstraction.

## 🚀 Tech Stack & Tools
| Category | Technologies |
|----------|--------------|
| **Core Framework** | Java 21, Spring Boot 4.0.2 |
| **Security** | Spring Security, JWT (0.12.3) |
| **Database/ORM** | Spring Data JPA, H2 (In-Memory), PostgreSQL (Docker) |
| **Build & Tools** | Maven, Lombok |

## 🔑 Key Features
*   **Secure Authentication & JWT**: Implements stateless security using **JSON Web Tokens (JWT)**. Unlike session-based auth, JWTs allow the server to scale easily as it doesn't need to store user state. Each request is validated via a filter chain to ensure stateless, secure, and performant access control.
*   **Inventory Management**: Full CRUD capabilities for managing book catalogs, pricing, and stock levels.
*   **Optimized Data Access**: Leverages Spring Data JPA for efficient query execution and persistence.
*   **RESTful Architecture**: Follows standard REST principles for predictable API endpoints.

## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/books` | Retrieve paginated list of books |
| `GET` | `/api/books/{id}` | Get book details by ID |
| `GET` | `/api/books/search` | Search books by keyword |
| `POST` | `/api/books` | Create new book (Admin only) |
| `PUT` | `/api/books/{id}` | Update book details (Admin only) |
| `DELETE` | `/api/books/{id}` | Remove book (Admin only) |

## 🔮 Future Enhancements
*   **Refresh Token Rotation**: Implementing secure token rotation to enhance session security and limit long-lived access token risks.
*   **Advanced Pagination & Filtering**: Adding multisort criteria and dynamic filters for complex book listings.
*   **PostgreSQL Migration**: Promote the Docker profile to a production-grade config (TLS, secrets, migrations).
*   **Container Hardening**: Add non-root user and smaller base images for production runs.
*   **API Documentation**: Integrating **Swagger/OpenAPI** for interactive and auto-generated API docs.

## 🔐 Test Credentials (Demo)
The application comes pre-loaded with sample data for quick evaluation.

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@bookstore.com` | `admin123` |
| **User** | `user@test.com` | `user123` |

## 🛠️ Getting Started

### Prerequisites
*   Java Development Kit (JDK) 21+
*   Maven 3.9+

### Installation & Run
1.  **Clone the repository**
    ```bash
    git clone https://github.com/paulopacifico/bookstore-ecommerce.git
    cd bookstore-ecommerce
    ```

2.  **Build the project**
    ```bash
    mvn clean install
    ```

3.  **Run the application**
    ```bash
    mvn spring-boot:run
    ```
    The API will be available at `http://localhost:8080`.

### Run with Docker + PostgreSQL
This uses the `docker` Spring profile and a local Postgres container.

```bash
docker compose up --build
```

Then access the API at `http://localhost:8080`.

## 📂 Project Structure
```
src/
├── main/
│   ├── java/com/bookstore/   # Core application logic
│   └── resources/            # Configs (application.yml, application-docker.yml)
└── test/                     # Unit and Integration tests
```

## 💡 Why This Project?
This application was developed to demonstrate proficiency in:
*   Building secure, production-ready APIs with **Spring Boot**.
*   Implementing modern authentication flows (**JWT**).
*   Writing maintainable, clean Java code compliant with industry standards.

---
## 👤 Author
**Paulo Pacifico**  
*Backend Java Developer*  
📍 **Canada**

## 📮 Postman
You can import the Postman collection and environment from the `postman/` folder.

1. Import `postman/bookstore.postman_environment.json`
2. Import `postman/bookstore.postman_collection.json`
3. Select the **Bookstore Local** environment

The collection uses `{{baseUrl}}` and `{{authToken}}` variables.

### Auto-save JWT token
The **Login** request includes a test script to store the token in `{{authToken}}` automatically after a successful response.
