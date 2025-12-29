import type { Context, Next } from 'hono';
import type { ZodSchema } from 'zod';
import { ValidationError } from '@/core/errors/base/validation-error';

/**
 * Request validation middleware factory
 * Validates request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
    return async (c: Context, next: Next) => {
        const body = await c.req.json();
        const result = schema.safeParse(body);

        if (!result.success) {
            const errors = result.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            throw new ValidationError('Validation failed', errors);
        }

        // Store validated data in context for later use
        c.set('validatedBody', result.data);
        await next();
    };
}

/**
 * Query params validation middleware factory
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
    return async (c: Context, next: Next) => {
        const query = c.req.query();
        const result = schema.safeParse(query);

        if (!result.success) {
            const errors = result.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            throw new ValidationError('Invalid query parameters', errors);
        }

        c.set('validatedQuery', result.data);
        await next();
    };
}

/**
 * Path params validation middleware factory
 */
export function validateParams<T>(schema: ZodSchema<T>) {
    return async (c: Context, next: Next) => {
        const params = c.req.param();
        const result = schema.safeParse(params);

        if (!result.success) {
            const errors = result.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            throw new ValidationError('Invalid path parameters', errors);
        }

        c.set('validatedParams', result.data);
        await next();
    };
}
