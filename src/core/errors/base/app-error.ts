/**
 * Base application error class
 * All custom errors should extend this class
 * 
 * @abstract - This class should not be instantiated directly
 */
export abstract class AppError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly statusCode: number,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
