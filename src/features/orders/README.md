# Orders Feature Module

This directory contains all code related to the Orders feature, following a **layered architecture** with **manual dependency injection**.

## Directory Structure

```
orders/
├── __tests__/              # Feature-specific tests
│   ├── order.controller.test.ts
│   └── order.service.test.ts
├── controllers/            # HTTP request handlers
│   └── order.controller.ts
├── repositories/           # Database access layer
│   └── order.repository.ts
├── routes/                 # Route definitions
│   └── order.routes.ts
├── services/               # Business logic layer
│   └── order.service.ts
├── types/                  # Type definitions & schemas
│   └── order.types.ts
├── errors/                 # Feature-specific errors
│   └── order-errors.ts
├── container.ts            # Dependency injection container
└── README.md               # This file
```

## Layered Architecture

Each layer has a specific responsibility:

1. **Routes** (`routes/`) - Define HTTP endpoints and wire them to controllers
2. **Controllers** (`controllers/`) - Handle HTTP requests/responses, validate input
3. **Services** (`services/`) - Implement business logic and orchestration
4. **Repositories** (`repositories/`) - Handle database operations
5. **Types** (`types/`) - Define data structures and validation schemas
6. **Errors** (`errors/`) - Feature-specific error classes

### Dependency Flow

```
Routes → Controllers → Services → Repositories → Database
```

Dependencies flow **downward only**. Each layer only depends on the layer directly below it.

## Dependency Injection Container

The `container.ts` file wires all dependencies for this feature:

```typescript
import { createOrdersContainer } from './container';

// Create the container
const ordersContainer = createOrdersContainer();

// Access dependencies
const { orderRepository, orderService, orderController, orderRoutes } = ordersContainer;
```

### Benefits of Feature Containers

1. **Encapsulation** - All feature dependencies are managed in one place
2. **Testability** - Easy to create test containers with mocked dependencies
3. **Scalability** - New features can be added without modifying the main container
4. **Type Safety** - TypeScript enforces dependency boundaries

## Testing

Tests are located in `__tests__/` and use the test container factory:

```typescript
import { createTestOrdersContainer } from '../container';

// Create a test container with mocked repository
const container = createTestOrdersContainer({
    orderRepository: mockRepository
});
```

## Adding New Features

When the application grows, create new feature modules following this same pattern:

1. Create a new feature directory (e.g., `src/features/users/`)
2. Implement the layered architecture
3. Create a feature-specific container (`users/container.ts`)
4. Import and use in the main application container (`src/container.ts`)

Example:

```typescript
// src/features/users/container.ts
export function createUsersContainer(): UsersContainer {
    // Wire user dependencies
}

// src/container.ts
import { createUsersContainer } from '@/features/users/container';

export function createContainer(): Container {
    return {
        orders: createOrdersContainer(),
        users: createUsersContainer(), // New feature
    };
}
```

## Design Principles

- **Single Responsibility** - Each class/function has one clear purpose
- **Dependency Injection** - Dependencies are injected, not created internally
- **Type Safety** - TypeScript enforces contracts at compile time
- **Testability** - All layers can be tested in isolation
- **Explicit is Better** - Manual DI makes dependencies visible and traceable
