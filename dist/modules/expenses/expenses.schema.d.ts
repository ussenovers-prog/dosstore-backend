import { z } from 'zod';
export declare const createExpenseSchema: z.ZodObject<{
    storeId: z.ZodNumber;
    category: z.ZodEnum<["salary", "rent", "utilities", "target_ads", "other"]>;
    expenseDate: z.ZodString;
    amount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
    isRecurring: z.ZodDefault<z.ZodBoolean>;
    source: z.ZodOptional<z.ZodString>;
    campaignName: z.ZodOptional<z.ZodString>;
    channel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    storeId: number;
    category: "other" | "salary" | "rent" | "utilities" | "target_ads";
    expenseDate: string;
    amount: number;
    isRecurring: boolean;
    source?: string | undefined;
    description?: string | undefined;
    campaignName?: string | undefined;
    channel?: string | undefined;
}, {
    storeId: number;
    category: "other" | "salary" | "rent" | "utilities" | "target_ads";
    expenseDate: string;
    amount: number;
    source?: string | undefined;
    description?: string | undefined;
    isRecurring?: boolean | undefined;
    campaignName?: string | undefined;
    channel?: string | undefined;
}>;
export declare const updateExpenseSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<["salary", "rent", "utilities", "target_ads", "other"]>>;
    expenseDate: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    isRecurring: z.ZodOptional<z.ZodBoolean>;
    campaignName: z.ZodOptional<z.ZodString>;
    channel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    category?: "other" | "salary" | "rent" | "utilities" | "target_ads" | undefined;
    expenseDate?: string | undefined;
    amount?: number | undefined;
    description?: string | undefined;
    isRecurring?: boolean | undefined;
    campaignName?: string | undefined;
    channel?: string | undefined;
}, {
    category?: "other" | "salary" | "rent" | "utilities" | "target_ads" | undefined;
    expenseDate?: string | undefined;
    amount?: number | undefined;
    description?: string | undefined;
    isRecurring?: boolean | undefined;
    campaignName?: string | undefined;
    channel?: string | undefined;
}>;
export declare const expenseQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    storeId: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodEnum<["salary", "rent", "utilities", "target_ads", "other"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    isRecurring: z.ZodOptional<z.ZodBoolean>;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    storeId?: number | undefined;
    source?: string | undefined;
    category?: "other" | "salary" | "rent" | "utilities" | "target_ads" | undefined;
    isRecurring?: boolean | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    storeId?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    source?: string | undefined;
    category?: "other" | "salary" | "rent" | "utilities" | "target_ads" | undefined;
    isRecurring?: boolean | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
//# sourceMappingURL=expenses.schema.d.ts.map