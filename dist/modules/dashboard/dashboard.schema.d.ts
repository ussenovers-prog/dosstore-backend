import { z } from 'zod';
export declare const dashboardQuerySchema: z.ZodObject<{
    storeId: z.ZodOptional<z.ZodNumber>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    granularity: z.ZodDefault<z.ZodEnum<["day", "week", "month"]>>;
}, "strip", z.ZodTypeAny, {
    granularity: "week" | "day" | "month";
    storeId?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    storeId?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    granularity?: "week" | "day" | "month" | undefined;
}>;
export declare const topProductsQuerySchema: z.ZodObject<{
    storeId: z.ZodOptional<z.ZodNumber>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    storeId?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    storeId?: number | undefined;
    limit?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export declare const abcAnalysisQuerySchema: z.ZodObject<{
    storeId: z.ZodOptional<z.ZodNumber>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    storeId?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    storeId?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
export type TopProductsQueryInput = z.infer<typeof topProductsQuerySchema>;
export type AbcAnalysisQueryInput = z.infer<typeof abcAnalysisQuerySchema>;
//# sourceMappingURL=dashboard.schema.d.ts.map