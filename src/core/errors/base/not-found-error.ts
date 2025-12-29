import { AppError } from './app-error';

/**
 * Resource not found error
 */
export class NotFoundError extends AppError {
    constructor(resource: string, identifier?: string | number) {
        const message = identifier
            ? `${resource} with id '${identifier}' not found`
            : `${resource} not found`;
        super('NOT_FOUND', message, 404);
    }
}
