import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { onErrorHandler } from '@/modules/shared/middleware/errorHandler';
import { successResponse } from '@/modules/shared/types/api.types';

/**
 * Creates and configures the Hono application
 */
export function createServer() {
    const app = new Hono();

    // Global middleware
    app.use('*', logger());
    app.use('*', cors());

    // Global error handler
    app.onError(onErrorHandler);

    // Health check endpoint
    app.get('/health', (c) => {
        return c.json(
            successResponse({
                status: 'healthy',
                timestamp: new Date().toISOString(),
            })
        );
    });

    return app;
}

export type App = ReturnType<typeof createServer>;
