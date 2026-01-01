# Honobun

A production-ready backend service built with **Bun**, **Hono**, **PostgreSQL**, and **TypeScript**.

This repository uses a strict **Layered Architecture** with **Manual Dependency Injection**. This README acts as the Honobun style guide, inspired by opinionated guides like Airbnb’s.

Honobun Style Guide — created by [Han Sena](https://hidayatabisena.com)

## Table of Contents

- [Project Goals](#project-goals)
- [Project Structure](#project-structure)
- [Basic Rules](#basic-rules)
- [Naming](#naming)
- [Layering Rules](#layering-rules)
- [Manual Dependency Injection](#manual-dependency-injection)
- [Validation & Errors](#validation--errors)
- [Testing](#testing)
- [Migrations & Runtime](#migrations--runtime)

## Project Goals

- Separation of concern
- Robust
- Scalable
- Easy to follow
- Testable

## Project Structure

```text
src/
├── app.ts                    # App assembly (mount feature routes)
├── container.ts              # Application container (wires infra + feature containers)
├── index.ts                  # Bun entrypoint
├── config/                   # Configuration & env validation
├── core/                     # Cross-cutting primitives (errors, etc.)
├── infrastructure/           # DB client, migrations, HTTP server factory
├── shared/                   # Shared middleware/types/helpers
└── features/                 # Feature modules (orders, widgets, ...)
    └── <feature>/
        ├── __tests__/        # Feature tests
        ├── controllers/      # HTTP concerns only
        ├── services/         # Business logic + validation
        ├── repositories/     # SQL access only
        ├── routes/           # Route definitions
        ├── types/            # Types + Zod schemas
        ├── errors/           # Feature errors
        └── container.ts      # Feature container (wires feature dependencies)
```

## Basic Rules

- Keep layers small and single-purpose: Routes → Controllers → Services → Repositories → Database
- Dependencies flow downward only; no upward imports
- Prefer explicit code over magic; avoid DI frameworks
- Validate at the boundary, not in the middle
- Throw typed errors; let the global handler format responses

## Naming

- **Folders**: plural feature name, e.g. `orders/`, `widgets/`
- **Files (layer suffix)**:
  - `*.controller.ts`
  - `*.service.ts`
  - `*.repository.ts`
  - `*.routes.ts`
  - `*-errors.ts`
  - `*.types.ts`
- **Routes**: resource-oriented paths under `/api/<feature>`
- **Exports**: prefer named exports; default exports only for Bun entry `src/index.ts`

## Layering Rules

### Routes

- Declare endpoints and delegate to controller methods
- No business logic, no validation logic

Example: [order.routes.ts](file:///Users/hansena/Documents/Aktiva/honobun/src/features/orders/routes/order.routes.ts)

### Controllers

- HTTP concerns only: read params/query/body, call service, format response
- Use shared helpers for JSON parsing

Example: [order.controller.ts](file:///Users/hansena/Documents/Aktiva/honobun/src/features/orders/controllers/order.controller.ts)

### Services

- Core business logic + orchestration
- Validate input using Zod schemas from `types/`
- Convert repository rows to API/domain shapes

Example: [order.service.ts](file:///Users/hansena/Documents/Aktiva/honobun/src/features/orders/services/order.service.ts)

### Repositories

- Database access only (SQL)
- No business rules, no HTTP logic

Example: [order.repository.ts](file:///Users/hansena/Documents/Aktiva/honobun/src/features/orders/repositories/order.repository.ts)

## Manual Dependency Injection

### Composition Root

- `src/container.ts` wires infrastructure dependencies and calls feature containers
- `src/app.ts` mounts feature routes

Example:

```ts
// src/container.ts
import { db } from '@/infrastructure/database/client';
import { createOrdersContainer } from '@/features/orders/container';

export function createContainer() {
  return {
    orders: createOrdersContainer({ db }),
  };
}
```

### Feature Containers

- A feature container wires repository → service → controller → routes
- Feature containers accept infrastructure deps (e.g. `{ db }`) as parameters

Example: [orders/container.ts](file:///Users/hansena/Documents/Aktiva/honobun/src/features/orders/container.ts)

## Validation & Errors

- Zod parsing happens in services (or shared validator middleware if adopted consistently)
- Invalid JSON body should throw `ValidationError`
- Feature-specific “not found” errors extend `NotFoundError`
- The global error handler is registered at server creation

References:
- Global server + error handler: [server.ts](file:///Users/hansena/Documents/Aktiva/honobun/src/infrastructure/http/server.ts)
- JSON body parsing helper: [parseJsonBody.ts](file:///Users/hansena/Documents/Aktiva/honobun/src/shared/http/parseJsonBody.ts)
- Error system overview: [core/errors/README.md](file:///Users/hansena/Documents/Aktiva/honobun/src/core/errors/README.md)

## Testing

- Test runner: Bun (`bun test`)
- **Services**: unit test with mocked repositories
- **Controllers**: integration test with Hono app + mocked service + `onErrorHandler`

Commands:

```bash
bun test
bun run typecheck
```

Examples:
- Orders tests: [orders/__tests__](file:///Users/hansena/Documents/Aktiva/honobun/src/features/orders/__tests__)
- Widgets tests: [widgets/__tests__](file:///Users/hansena/Documents/Aktiva/honobun/src/features/widgets/__tests__)

## Migrations & Runtime

Prerequisites:
- [Bun](https://bun.sh/)
- [Hono](https://hono.dev/)
- [PostgreSQL](https://www.postgresql.org/)

Common commands:

```bash
bun install
bun run dev
bun run migrate:up
bun run migrate:down
```
