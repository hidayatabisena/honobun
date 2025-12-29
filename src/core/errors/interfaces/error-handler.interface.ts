import type { Context } from 'hono';

/**
 * Interface for error handlers
 * Each handler is responsible for a specific type of error
 */
export interface IErrorHandler {
    /**
     * Determines if this handler can handle the given error
     */
    canHandle(error: unknown): boolean;

    /**
     * Handles the error and returns an HTTP response
     */
    handle(error: unknown, c: Context): Response | Promise<Response>;
}

/**
 * Interface for error logging services
 * Allows swapping logging implementations (Console, Sentry, Datadog, etc.)
 */
export interface IErrorLogger {
    /**
     * Logs an error with optional context
     */
    log(error: unknown, context?: Record<string, any>): void;
}
