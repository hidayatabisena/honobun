import type { Context } from 'hono';
import type { IErrorHandler, IErrorLogger } from '../interfaces/error-handler.interface';

/**
 * Error Handler Registry (Composite Pattern)
 * Manages multiple error handlers and delegates to the appropriate one
 * 
 * Handlers are checked in registration order, so register specific handlers
 * before generic ones (e.g., AppErrorHandler before DefaultErrorHandler)
 */
export class ErrorHandlerRegistry {
    private handlers: IErrorHandler[] = [];
    private logger: IErrorLogger;

    constructor(logger: IErrorLogger) {
        this.logger = logger;
    }

    /**
     * Register an error handler
     * Order matters: handlers are checked in registration order
     */
    register(handler: IErrorHandler): void {
        this.handlers.push(handler);
    }

    /**
     * Handle an error by delegating to the appropriate handler
     * Logs the error before handling
     */
    async handle(error: unknown, c: Context): Promise<Response> {
        // Log the error with request context
        this.logger.log(error, {
            path: c.req.path,
            method: c.req.method,
        });

        // Find appropriate handler
        for (const handler of this.handlers) {
            if (handler.canHandle(error)) {
                return handler.handle(error, c);
            }
        }

        // This should never happen if DefaultErrorHandler is registered last
        throw new Error('No error handler found');
    }
}
