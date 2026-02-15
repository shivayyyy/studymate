/**
 * Success API response helper
 */
export const success = <T>(data: T, message = 'Success', meta?: any) => ({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
});

/**
 * Error API response helper
 */
export const error = (message: string, statusCode = 500) => ({
    success: false,
    message,
    error: message,
});

/**
 * Paginated API response helper
 */
export const paginate = <T>(data: T[], total: number, page: number, limit: number) => ({
    success: true,
    message: 'Success',
    data,
    meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
    },
});

/**
 * Generate a slug from a string
 */
export const slugify = (text: string): string =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

/**
 * Parse pagination query params
 */
export const parsePagination = (query: { page?: string; limit?: string }) => ({
    page: Math.max(1, parseInt(query.page || '1')),
    limit: Math.min(100, Math.max(1, parseInt(query.limit || '20'))),
});

/**
 * Format duration from minutes to human-readable string
 */
export const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Calculate time difference in human-readable format
 */
export const timeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals: [number, string][] = [
        [31536000, 'year'],
        [2592000, 'month'],
        [86400, 'day'],
        [3600, 'hour'],
        [60, 'minute'],
        [1, 'second'],
    ];

    for (const [secondsInUnit, unit] of intervals) {
        const count = Math.floor(seconds / secondsInUnit);
        if (count >= 1) return count === 1 ? `1 ${unit} ago` : `${count} ${unit}s ago`;
    }
    return 'just now';
};

/**
 * Async error handler wrapper for Express route handlers
 */
export const asyncHandler = (fn: Function) =>
    (req: any, res: any, next: any) =>
        Promise.resolve(fn(req, res, next)).catch(next);
