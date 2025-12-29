import { AppError } from './app-error';

/**
 * Forbidden access error
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Access forbidden') {
        super('FORBIDDEN', message, 403);
    }
}
