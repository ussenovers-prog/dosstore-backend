import { z } from 'zod';
export declare const createVisitorSchema: z.ZodObject<{
    storeId: z.ZodNumber;
    visitDate: z.ZodString;
    count: z.ZodNumber;
    buyersCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    storeId: number;
    visitDate: string;
    count: number;
    buyersCount: number;
}, {
    storeId: number;
    visitDate: string;
    count: number;
    buyersCount?: number | undefined;
}>;
export declare const updateVisitorSchema: z.ZodObject<{
    count: z.ZodOptional<z.ZodNumber>;
    buyersCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    count?: number | undefined;
    buyersCount?: number | undefined;
}, {
    count?: number | undefined;
    buyersCount?: number | undefined;
}>;
export declare const visitorQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    storeId: z.ZodOptional<z.ZodNumber>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    storeId?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    storeId?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export type CreateVisitorInput = z.infer<typeof createVisitorSchema>;
export type UpdateVisitorInput = z.infer<typeof updateVisitorSchema>;
export type VisitorQueryInput = z.infer<typeof visitorQuerySchema>;
//# sourceMappingURL=visitors.schema.d.ts.map