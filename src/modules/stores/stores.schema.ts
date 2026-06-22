import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(100),
  code: z.string().min(1, 'Store code is required').max(20),
  address: z.string().optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
