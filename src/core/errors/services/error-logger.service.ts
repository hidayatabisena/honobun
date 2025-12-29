import type { IErrorLogger } from '../interfaces/error-handler.interface';
import { env } from '@/config/env';

/**
 * Console-based error logger
 * Logs errors to console with timestamp and context
 * Can be easily swapped with other implementations (Sentry, Datadog, etc.)
 */
export class ConsoleErrorLogger implements IErrorLogger {
    log(error: unknown, context?: Record<string, any>): void {
        // Don't log in test environment to keep test output clean
        if (env.NODE_ENV === 'test') return;

        console.error('[Error]', {
            error,
            timestamp: new Date().toISOString(),
            ...context,
        });
    }
}

/**
 * Example: Sentry error logger (implementation placeholder)
 * Uncomment and implement when integrating Sentry
 */
// export class SentryErrorLogger implements IErrorLogger {
//     log(error: unknown, context?: Record<string, any>): void {
//         Sentry.captureException(error, { extra: context });
//     }
// }

/**
 * Example: Datadog error logger (implementation placeholder)
 * Uncomment and implement when integrating Datadog
 */
// export class DatadogErrorLogger implements IErrorLogger {
//     log(error: unknown, context?: Record<string, any>): void {
//         // Datadog logging implementation
//     }
// }
