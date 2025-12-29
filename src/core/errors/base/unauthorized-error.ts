import { AppError } from './app-error';

/**
 * Unauthorized access error
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized access') {
        super('UNAUTHORIZED', message, 401);
    }
}
