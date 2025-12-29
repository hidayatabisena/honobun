import { ErrorHandlerRegistry } from '../registry/error-handler.registry';
import { ConsoleErrorLogger } from '../services/error-logger.service';
import { AppErrorHandler } from '../handlers/app-error.handler';
import { ZodErrorHandler } from '../handlers/zod-error.handler';
import { DefaultErrorHandler } from '../handlers/default-error.handler';

/**
 * Bootstrap error handling system
 * Sets up the error handler registry with all handlers
 * 
 * Order matters: specific handlers first, default last
 * - AppErrorHandler: handles all custom application errors
 * - ZodErrorHandler: handles Zod validation errors
 * - DefaultErrorHandler: fallback for all other errors
 * 
 * @returns Configured ErrorHandlerRegistry
 */
export function setupErrorHandling(): ErrorHandlerRegistry {
    // Create logger (can be swapped with SentryErrorLogger, etc.)
    const logger = new ConsoleErrorLogger();

    // Create registry
    const registry = new ErrorHandlerRegistry(logger);

    // Register handlers in order (specific to general)
    registry.register(new AppErrorHandler());
    registry.register(new ZodErrorHandler());
    registry.register(new DefaultErrorHandler()); // Fallback - must be last

    return registry;
}
