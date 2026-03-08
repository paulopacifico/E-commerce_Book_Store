# Complete Guide: Angular Frontend with Cursor AI
## E-commerce Book Store - Optimized Configuration

---

## 📋 Table of Contents
1. [Project Structure](#project-structure)
2. [Initial Setup](#initial-setup)
3. [Cursor Skills](#cursor-skills)
4. [Development Rules](#development-rules)
5. [Recommended Workflow](#recommended-workflow)

---

## 🏗️ Project Structure

```
bookstore-frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services, guards, interceptors
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── services/
│   │   │   └── models/
│   │   ├── shared/                  # Shared components, pipes, directives
│   │   │   ├── components/
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   ├── features/                # Feature modules
│   │   │   ├── auth/
│   │   │   ├── books/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   └── categories/
│   │   └── layout/                  # Header, footer, sidebar
│   ├── assets/
│   ├── environments/
│   └── styles/
└── .cursorrules                     # Cursor configuration
```

---

## ⚙️ Initial Setup

### 1. Create Angular project
```bash
ng new bookstore-frontend --routing --style=scss --strict
cd bookstore-frontend
npm install
```

### 2. Install essential dependencies
```bash
# UI Framework (choose one)
npm install @angular/material @angular/cdk
# OR
npm install primeng primeicons

# Utilities
npm install rxjs lodash-es
npm install --save-dev @types/lodash-es

# HTTP & Storage
npm install ngx-cookie-service
```

---

## 🎯 Cursor Skills

### Create `.cursorrules` file in project root:

See the project root `.cursorrules` file for the full Angular E-commerce Bookstore rules (architecture, patterns, API, UI/UX, state management, performance, and workflow).

---

## 🔄 Workflow with Cursor

### 1. Planning
Before coding, ask Cursor:
```
List the files that need to be created to implement [feature]
```

### 2. Iterative Implementation
```
1. Create interface/model
2. Create service
3. Create component
4. Add routing
5. Test integration
```

### 3. Validation
```
Review the created code and suggest improvements for:
- Performance
- Type safety
- Angular best practices
```

---

**Version**: 1.0  
**Last updated**: 2026-03-07
