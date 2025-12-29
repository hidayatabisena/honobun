import type { Context, ErrorHandler } from 'hono';
import { AppError } from '@/core/errors/base/app-error';
import { errorResponse } from '../types/api.types';
import { env } from '@/config/env';

/**
 * Global error handler for Hono's onError
 * Catches all errors and returns standard API response format
 */
export const onErrorHandler: ErrorHandler = (error, c: Context) => {
    // Log error in non-test environments
    if (env.NODE_ENV !== 'test') {
        console.error('[Error]', error);
    }

    // Handle known application errors
    if (error instanceof AppError) {
        return c.json(
            errorResponse(error.code, error.message, error.details),
            error.statusCode as any
        );
    }

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
        return c.json(
            errorResponse('VALIDATION_ERROR', 'Invalid request data', error),
            400
        );
    }

    // Handle unknown errors
    const message =
        env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error instanceof Error
                ? error.message
                : 'Unknown error';

    return c.json(errorResponse('INTERNAL_ERROR', message), 500);
};
