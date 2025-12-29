# Widgets Feature Module

This directory contains all code related to the Widgets feature, following a **layered architecture** with **manual dependency injection**.

## Directory Structure

```
widgets/
├── __tests__/              # Feature-specific tests
│   ├── widget.controller.test.ts
│   └── widget.service.test.ts
├── controllers/            # HTTP request handlers
│   └── widget.controller.ts
├── repositories/           # Database access layer
│   └── widget.repository.ts
├── routes/                 # Route definitions
│   └── widget.routes.ts
├── services/               # Business logic layer
│   └── widget.service.ts
├── types/                  # Type definitions & schemas
│   └── widget.types.ts
├── errors/                 # Feature-specific errors
│   └── widget-errors.ts
├── container.ts            # Dependency injection container
└── README.md               # This file
```

## Layered Architecture

Each layer has a specific responsibility:

1. **Routes** (`routes/`) - Define HTTP endpoints and wire them to controllers
2. **Controllers** (`controllers/`) - Handle HTTP requests/responses, parse input
3. **Services** (`services/`) - Implement business logic and schema validation
4. **Repositories** (`repositories/`) - Handle database operations
5. **Types** (`types/`) - Define data structures and validation schemas
6. **Errors** (`errors/`) - Feature-specific error classes

### Dependency Flow

```
Routes → Controllers → Services → Repositories → Database
```

Dependencies flow **downward only**. Each layer only depends on the layer directly below it.

## Dependency Injection Container

The `container.ts` file wires all dependencies for this feature.

This project uses strict layering: infrastructure dependencies (like `db`) are provided from the application container, then injected into the feature container.

```typescript
import { db } from '@/infrastructure/database/client';
import { createWidgetsContainer } from './container';

const widgetsContainer = createWidgetsContainer({ db });

const { widgetRepository, widgetService, widgetController, widgetRoutes } = widgetsContainer;
```

### API Mount Point

Routes are mounted under:

```
/api/widgets
```

## Testing

Tests are located in `__tests__/` and follow the same pattern as the Orders feature:

- **Service tests**: business logic in isolation using a mocked repository
- **Controller tests**: HTTP layer integration using a mocked service + `onErrorHandler`

If you want to construct a feature container for tests with overrides:

```typescript
import { db } from '@/infrastructure/database/client';
import { createTestWidgetsContainer } from '../container';

const container = createTestWidgetsContainer(
  { db },
  {
    widgetRepository: mockRepository,
  }
);
```

## Adding New Features

When the application grows, create new feature modules following this same pattern:

1. Create a new feature directory (e.g., `src/features/users/`)
2. Implement the layered architecture
3. Create a feature-specific container (`users/container.ts`) that accepts infra deps
4. Import and use in the main application container (`src/container.ts`)
5. Mount routes in the application factory (`src/app.ts`)

## Design Principles

- **Single Responsibility** - Each class/function has one clear purpose
- **Dependency Injection** - Dependencies are injected, not created internally
- **Type Safety** - TypeScript enforces contracts at compile time
- **Testability** - All layers can be tested in isolation
- **Explicit is Better** - Manual DI makes dependencies visible and traceable

