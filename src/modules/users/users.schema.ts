import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['owner', 'employee']).default('employee'),
  storeId: z.number().int().positive().optional(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  role: z.enum(['owner', 'employee']).optional(),
  storeId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(50),
  role: z.enum(['owner', 'employee']).optional(),
  storeId: z.coerce.number().int().positive().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
