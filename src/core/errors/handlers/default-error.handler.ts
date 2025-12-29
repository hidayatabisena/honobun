import type { Context } from 'hono';
import type { IErrorHandler } from '../interfaces/error-handler.interface';
import { errorResponse } from '@/shared/types/api.types';
import { env } from '@/config/env';

/**
 * Default fallback error handler
 * Handles all unhandled errors as internal server errors
 * Always returns true for canHandle (should be registered last)
 */
export class DefaultErrorHandler implements IErrorHandler {
    canHandle(_error: unknown): boolean {
        return true; // Always handles as fallback
    }

    handle(error: unknown, c: Context): Response {
        const message =
            env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : error instanceof Error
                    ? error.message
                    : 'Unknown error';

        return c.json(errorResponse('INTERNAL_ERROR', message), 500);
    }
}
