# honobun

A high-scale, production-ready backend service built with **Bun**, **PostgreSQL**, and **TypeScript**.

## 🚀 Overview

This project follows a strict **Layered Architecture** with **Manual Dependency Injection** to ensure testability, scalability, and maintainability.

### Key Principles
- **Module-based structure**: Each feature (orders, users) is self-contained.
- **Clear Layering**: Controller → Service → Repository.
- **Manual DI**: Dependencies are wired in a single location (`src/container.ts`).
- **No ORM**: Direct SQL queries using **postgres.js** for maximum performance and control.
- **Type Safety**: Zod-validated environment and request/response types.

## 📂 Project Structure

```text
src/
├── config/             # Configuration & Env validation
├── modules/            # domain modules (orders, etc.)
│   └── shared/         # Shared types & middleware
├── infrastructure/     # DB client & HTTP server
├── container.ts        # Manual DI Container
├── app.ts              # App assembly
└── index.ts            # Entry point
```

## 🛠 Prerequisites
- [Bun](https://bun.sh/) (v1.0.0+)
- [PostgreSQL](https://www.postgresql.org/)

## 🚦 Getting Started

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   bun install
   ```
3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   ```
4. **Run migrations**
   ```bash
   bun run migrate:up
   ```
5. **Start development server**
   ```bash
   bun run dev
   ```

## 🧪 Testing

The project uses Bun's built-in test runner. Coverage goals are 80%+ for Services.

```bash
bun test         # Run all tests
bun test --coverage # Run with coverage
```

## 🏗 Architecture Layers

1. **Repository**: Direct database access using SQL. No business logic.
2. **Service**: Core business logic, orchestration, and validation.
3. **Controller**: HTTP handling, request parsing, and response formatting.
