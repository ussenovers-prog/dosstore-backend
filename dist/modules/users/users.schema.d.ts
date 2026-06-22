import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["owner", "employee"]>>;
    storeId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
    role: "owner" | "employee";
    storeId?: number | undefined;
}, {
    email: string;
    password: string;
    fullName: string;
    role?: "owner" | "employee" | undefined;
    storeId?: number | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["owner", "employee"]>>;
    storeId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    fullName?: string | undefined;
    role?: "owner" | "employee" | undefined;
    storeId?: number | null | undefined;
    isActive?: boolean | undefined;
}, {
    fullName?: string | undefined;
    role?: "owner" | "employee" | undefined;
    storeId?: number | null | undefined;
    isActive?: boolean | undefined;
}>;
export declare const userQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    role: z.ZodOptional<z.ZodEnum<["owner", "employee"]>>;
    storeId: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    role?: "owner" | "employee" | undefined;
    storeId?: number | undefined;
    isActive?: boolean | undefined;
}, {
    role?: "owner" | "employee" | undefined;
    storeId?: number | undefined;
    isActive?: boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
//# sourceMappingURL=users.schema.d.ts.map