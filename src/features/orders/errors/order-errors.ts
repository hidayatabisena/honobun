import { NotFoundError } from '@/core/errors/base/not-found-error';

/**
 * Specific Order errors
 */
export class OrderNotFoundError extends NotFoundError {
    constructor(identifier: string | number) {
        super('Order', identifier);
    }
}
