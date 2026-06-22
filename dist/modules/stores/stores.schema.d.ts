import { z } from 'zod';
export declare const createStoreSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    address?: string | undefined;
}, {
    code: string;
    name: string;
    address?: string | undefined;
}>;
export declare const updateStoreSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    address?: string | undefined;
}, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    address?: string | undefined;
}>;
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
//# sourceMappingURL=stores.schema.d.ts.map