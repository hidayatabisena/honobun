import { NotFoundError } from '@/core/errors/base/not-found-error';

export class WidgetNotFoundError extends NotFoundError {
    constructor(identifier: string | number) {
        super('Widget', identifier);
    }
}

