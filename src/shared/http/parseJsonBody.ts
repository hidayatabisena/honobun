import type { Context } from 'hono';
import { ValidationError } from '@/core/errors/base/validation-error';

export async function parseJsonBody(c: Context): Promise<unknown> {
    try {
        return await c.req.json();
    } catch {
        throw new ValidationError('Invalid JSON body');
    }
}

