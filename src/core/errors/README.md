# Error Handling Architecture

This directory contains a scalable, maintainable error handling system based on **interfaces**, **handlers**, and the **composite pattern**.

## Architecture Overview

```
core/errors/
├── interfaces/          # Contracts for handlers and loggers
├── base/               # Base error classes
├── handlers/           # Specific error handlers (Single Responsibility)
├── services/           # Error logging services
├── registry/           # Error handler registry (Composite Pattern)
└── bootstrap/          # Setup and configuration
```

## Key Concepts

### 1. Error Interfaces (Contracts)

Define contracts that allow dependency injection and easy swapping of implementations:

```typescript
// interfaces/error-handler.interface.ts
export interface IErrorHandler {
    canHandle(error: unknown): boolean;
    handle(error: unknown, c: Context): Response | Promise<Response>;
}

export interface IErrorLogger {
    log(error: unknown, context?: Record<string, any>): void;
}
```

### 2. Base Error Classes

All custom errors extend `AppError`:

```typescript
// base/app-error.ts
export abstract class AppError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly statusCode: number,
        public readonly details?: unknown
    ) { ... }
}

// base/validation-error.ts
export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super('VALIDATION_ERROR', message, 400, details);
    }
}
```

### 3. Error Handlers (Single Responsibility)

Each handler is responsible for one type of error:

```typescript
// handlers/app-error.handler.ts
export class AppErrorHandler implements IErrorHandler {
    canHandle(error: unknown): boolean {
        return error instanceof AppError;
    }

    handle(error: unknown, c: Context): Response {
        const appError = error as AppError;
        return c.json(
            errorResponse(appError.code, appError.message, appError.details),
            appError.statusCode as any
        );
    }
}
```

### 4. Error Logger Service

Pluggable logging implementation:

```typescript
// services/error-logger.service.ts
export class ConsoleErrorLogger implements IErrorLogger {
    log(error: unknown, context?: Record<string, any>): void {
        console.error('[Error]', { error, timestamp: new Date().toISOString(), ...context });
    }
}

// Easy to swap with:
// - SentryErrorLogger
// - DatadogErrorLogger
// - CloudWatchErrorLogger
```

### 5. Error Handler Registry (Composite Pattern)

Manages multiple handlers and delegates to the appropriate one:

```typescript
// registry/error-handler.registry.ts
export class ErrorHandlerRegistry {
    private handlers: IErrorHandler[] = [];
    private logger: IErrorLogger;

    register(handler: IErrorHandler): void { ... }
    async handle(error: unknown, c: Context): Promise<Response> { ... }
}
```

### 6. Bootstrap Setup

Wires everything together:

```typescript
// bootstrap/setup-error-handling.ts
export function setupErrorHandling(): ErrorHandlerRegistry {
    const logger = new ConsoleErrorLogger();
    const registry = new ErrorHandlerRegistry(logger);

    // Order matters: specific handlers first, default last
    registry.register(new AppErrorHandler());
    registry.register(new ZodErrorHandler());
    registry.register(new DefaultErrorHandler()); // Fallback

    return registry;
}
```

## Creating Feature-Specific Errors

### Example: Auth Feature

```typescript
// features/auth/errors/auth-errors.ts
import { AppError } from '@/core/errors/base/app-error';

export class AuthError extends AppError {
    constructor(code: string, message: string, statusCode = 401) {
        super(code, message, statusCode);
    }
}

export class InvalidCredentialsError extends AuthError {
    constructor() {
        super('INVALID_CREDENTIALS', 'Invalid credentials provided');
    }
}

export class TokenExpiredError extends AuthError {
    constructor() {
        super('TOKEN_EXPIRED', 'Authentication token has expired');
    }
}

export class AccountLockedError extends AuthError {
    constructor(unlockTime: Date) {
        super('ACCOUNT_LOCKED', 'Account is temporarily locked', 403);
        this.details = { unlockTime };
    }
}
```

### Example: Payment Feature

```typescript
// features/payments/errors/payment-errors.ts
import { AppError } from '@/core/errors/base/app-error';

export class PaymentError extends AppError {
    constructor(code: string, message: string, statusCode = 400) {
        super(code, message, statusCode);
    }
}

export class InsufficientFundsError extends PaymentError {
    constructor(amount: number, available: number) {
        super(
            'INSUFFICIENT_FUNDS',
            'Insufficient funds for transaction',
            402
        );
        this.details = { required: amount, available };
    }
}

export class PaymentGatewayError extends PaymentError {
    constructor(gatewayMessage: string) {
        super('PAYMENT_GATEWAY_ERROR', 'Payment processing failed', 502);
        this.details = { gatewayMessage };
    }
}
```

## Usage in Services

```typescript
// features/auth/services/auth.service.ts
import { InvalidCredentialsError, TokenExpiredError } from '../errors/auth-errors';

export class AuthService {
    async login(email: string, password: string) {
        const user = await this.findUser(email);
        
        if (!user) {
            throw new InvalidCredentialsError();
        }

        const valid = await this.verifyPassword(password, user.password);
        
        if (!valid) {
            throw new InvalidCredentialsError();
        }

        return this.generateToken(user);
    }

    async verifyToken(token: string) {
        const decoded = this.decodeToken(token);
        
        if (decoded.exp < Date.now()) {
            throw new TokenExpiredError();
        }

        return decoded;
    }
}
```

## Benefits

1. **Single Responsibility** - Each handler handles one type of error
2. **Open/Closed Principle** - Easy to add new handlers without modifying existing code
3. **Dependency Injection** - Easy to swap implementations (e.g., different loggers)
4. **Type Safety** - TypeScript enforces contracts
5. **Testability** - Each component can be tested in isolation
6. **Scalability** - New features can add their own error types without touching core

## Adding a New Error Handler

1. Create a new handler implementing `IErrorHandler`
2. Register it in `bootstrap/setup-error-handling.ts`
3. Ensure it's registered in the correct order (specific before general)

```typescript
// Example: Adding a custom database error handler
export class DatabaseErrorHandler implements IErrorHandler {
    canHandle(error: unknown): boolean {
        return error instanceof DatabaseError;
    }

    handle(error: unknown, c: Context): Response {
        // Custom handling logic
    }
}

// Register in bootstrap
registry.register(new DatabaseErrorHandler());
registry.register(new AppErrorHandler());
// ... other handlers
```

## Swapping Logger Implementation

To use Sentry instead of console logging:

```typescript
// services/error-logger.service.ts
import * as Sentry from '@sentry/node';

export class SentryErrorLogger implements IErrorLogger {
    log(error: unknown, context?: Record<string, any>): void {
        Sentry.captureException(error, { extra: context });
    }
}

// Update bootstrap/setup-error-handling.ts
const logger = new SentryErrorLogger(); // Instead of ConsoleErrorLogger
```
