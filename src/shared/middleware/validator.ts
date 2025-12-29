import type { Context, Next } from 'hono';
import type { ZodSchema } from 'zod';
import { ValidationError } from '@/core/errors/base/validation-error';

/**
 * Request validation middleware factory
 * Validates request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
    return async (c: Context, next: Next) => {
        let body: unknown;
        try {
            body = await c.req.json();
        } catch {
            throw new ValidationError('Invalid JSON body');
        }

        c.set('validationErrorMessage', 'Validation failed');
        const parsed = schema.parse(body);

        // Store validated data in context for later use
        c.set('validatedBody', parsed);
        await next();
    };
}

/**
 * Query params validation middleware factory
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
    return async (c: Context, next: Next) => {
        const query = c.req.query();

        c.set('validationErrorMessage', 'Invalid query parameters');
        const parsed = schema.parse(query);

        c.set('validatedQuery', parsed);
        await next();
    };
}

/**
 * Path params validation middleware factory
 */
export function validateParams<T>(schema: ZodSchema<T>) {
    return async (c: Context, next: Next) => {
        const params = c.req.param();

        c.set('validationErrorMessage', 'Invalid path parameters');
        const parsed = schema.parse(params);

        c.set('validatedParams', parsed);
        await next();
    };
}
