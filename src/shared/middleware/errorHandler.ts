import type { ErrorHandler } from 'hono';
import { setupErrorHandling } from '@/core/errors/bootstrap/setup-error-handling';

/**
 * Global error handler for Hono's onError
 * Uses the ErrorHandlerRegistry to delegate to appropriate handlers
 * 
 * The registry is set up once at module load time and reused for all requests
 */
const errorRegistry = setupErrorHandling();

/**
 * Hono error handler middleware
 * Catches all errors and delegates to the error registry
 */
export const onErrorHandler: ErrorHandler = async (error, c) => {
    return errorRegistry.handle(error, c);
};

