import type { Context } from 'hono';
import type { IErrorHandler } from '../interfaces/error-handler.interface';
import { ZodError } from 'zod';
import { errorResponse } from '@/shared/types/api.types';

/**
 * Handles Zod validation errors
 * Converts Zod errors to standardized API validation error responses
 */
export class ZodErrorHandler implements IErrorHandler {
    canHandle(error: unknown): boolean {
        return error instanceof ZodError;
    }

    handle(error: unknown, c: Context): Response {
        const zodError = error as ZodError;

        const details = zodError.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));

        const messageFromContext = c.get('validationErrorMessage');
        const message =
            typeof messageFromContext === 'string'
                ? messageFromContext
                : 'Invalid request data';

        return c.json(
            errorResponse('VALIDATION_ERROR', message, details),
            400
        );
    }
}
