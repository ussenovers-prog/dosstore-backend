export interface PaginatedResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ApiResponse<T> {
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}
export interface ApiError {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}
export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}
export declare function buildPagination(page: number, limit: number, total: number): PaginatedResult<unknown>['meta'];
//# sourceMappingURL=common.d.ts.map