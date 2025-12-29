import type { Context, Next } from 'hono';
import { logger } from 'hono/logger';
import { env } from '@/config/env';

export function requestLogger() {
    if (env.NODE_ENV === 'test') {
        return async (_c: Context, next: Next) => {
            await next();
        };
    }

    return logger((message: string, ...rest: string[]) => {
        console.log(message, ...rest);
    });
}

