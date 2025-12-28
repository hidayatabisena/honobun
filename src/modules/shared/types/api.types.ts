/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ApiMeta;
}

export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}

export interface ApiMeta {
    page?: number;
    limit?: number;
    total?: number;
    count?: number;
}

/**
 * Helper functions to create standard responses
 */
export function successResponse<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
    return {
        success: true,
        data,
        ...(meta && { meta }),
    };
}

export function errorResponse(
    code: string,
    message: string,
    details?: unknown
): ApiResponse<never> {
    const error: ApiError = {
        code,
        message,
    };
    if (details !== undefined) {
        error.details = details;
    }
    return {
        success: false,
        error,
    };
}

export function paginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): ApiResponse<T[]> {
    return {
        success: true,
        data,
        meta: {
            page,
            limit,
            total,
            count: data.length,
        },
    };
}
