# 📚 E-Commerce Book Store API

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?logo=springboot&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Security-JWT-000000?logo=jsonwebtokens)

---

## Professional Overview

This project is a **production-oriented backend API** for a digital bookstore, designed with a strong focus on **security**, **scalability**, and **maintainability**.

Built with **Java 21** and **Spring Boot**, the application follows clean architecture principles, enforces clear domain boundaries, and exposes a well-defined REST API suitable for front-end and third-party consumption.

Authentication is fully **stateless**, using **JWT**, and the persistence layer is designed to avoid common JPA pitfalls such as **N+1 queries** and **lazy-loading issues**.

---

## 🚀 Tech Stack & Tools

| Category | Technologies |
|--------|--------------|
| **Core Framework** | Java 21, Spring Boot |
| **Security** | Spring Security, JWT (0.12.3) |
| **Database / ORM** | Spring Data JPA, H2 (dev), PostgreSQL (Docker) |
| **Build & Tooling** | Maven, Lombok |
| **Containerization** | Docker, Docker Compose |

---

## 🔑 Key Features

- **Stateless Authentication with JWT**  
  Token-based authentication using Spring Security filters, enabling horizontal scalability without server-side session state.

- **Role-Based Access Control (RBAC)**  
  Clear separation between public endpoints and admin-only operations.

- **Optimized Data Access Layer**  
  Repository-level queries and DTO boundaries to prevent N+1 queries and lazy initialization problems.

- **Inventory & Catalog Management**  
  Full CRUD support for managing books, pricing, and availability.

- **RESTful API Design**  
  Resource-oriented endpoints following REST best practices.

---

## 📡 API Endpoints (Excerpt)

| Method | Endpoint | Access | Description |
|------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate and receive JWT |
| `GET` | `/api/books` | Public | Retrieve paginated list of books |
| `GET` | `/api/books/{id}` | Public | Get book details |
| `GET` | `/api/books/search` | Public | Search books by keyword |
| `POST` | `/api/books` | Admin | Create a new book |
| `PUT` | `/api/books/{id}` | Admin | Update book details |
| `DELETE` | `/api/books/{id}` | Admin | Delete a book |

---

## 🔐 Demo Credentials

Preloaded users are available for quick evaluation:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@bookstore.com` | `admin123` |
| **User** | `user@test.com` | `user123` |

---

## 🛠️ Getting Started

### Prerequisites
- Java Development Kit (JDK) 21+
- Maven 3.9+

### Local Run

```bash
git clone https://github.com/paulopacifico/bookstore-ecommerce.git
cd bookstore-ecommerce
mvn clean install
mvn spring-boot:run
