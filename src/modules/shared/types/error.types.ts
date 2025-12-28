/**
 * Base application error class
 */
export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(
        message: string,
        code: string = 'INTERNAL_ERROR',
        statusCode: number = 500,
        details?: unknown
    ) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Resource not found error
 */
export class NotFoundError extends AppError {
    constructor(resource: string, identifier?: string | number) {
        const message = identifier
            ? `${resource} with id '${identifier}' not found`
            : `${resource} not found`;
        super(message, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}

/**
 * Validation error for invalid input
 */
export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 'VALIDATION_ERROR', 400, details);
        this.name = 'ValidationError';
    }
}

/**
 * Conflict error for duplicate resources
 */
export class ConflictError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 'CONFLICT', 409, details);
        this.name = 'ConflictError';
    }
}

/**
 * Unauthorized access error
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized access') {
        super(message, 'UNAUTHORIZED', 401);
        this.name = 'UnauthorizedError';
    }
}

/**
 * Forbidden access error
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Access forbidden') {
        super(message, 'FORBIDDEN', 403);
        this.name = 'ForbiddenError';
    }
}
