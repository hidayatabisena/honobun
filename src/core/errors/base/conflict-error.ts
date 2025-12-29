import { AppError } from './app-error';

/**
 * Conflict error for duplicate resources
 */
export class ConflictError extends AppError {
    constructor(message: string, details?: unknown) {
        super('CONFLICT', message, 409, details);
    }
}
