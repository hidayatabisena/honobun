import type { Context } from 'hono';
import type { IErrorHandler } from '../interfaces/error-handler.interface';
import { AppError } from '../base/app-error';
import { errorResponse } from '@/shared/types/api.types';

/**
 * Handles all AppError instances
 * Converts them to standardized API error responses
 */
export class AppErrorHandler implements IErrorHandler {
    canHandle(error: unknown): boolean {
        return error instanceof AppError;
    }

    handle(error: unknown, c: Context): Response {
        const appError = error as AppError;
        return c.json(
            errorResponse(appError.code, appError.message, appError.details),
            appError.statusCode as any
        );
    }
}
