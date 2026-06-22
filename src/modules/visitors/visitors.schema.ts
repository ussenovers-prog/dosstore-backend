import { z } from 'zod';

export const createVisitorSchema = z.object({
  storeId: z.number().int().positive(),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  count: z.number().int().min(0, 'Visitors count must be >= 0'),
  buyersCount: z.number().int().min(0).default(0),
});

export const updateVisitorSchema = z.object({
  count: z.number().int().min(0).optional(),
  buyersCount: z.number().int().min(0).optional(),
});

export const visitorQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(50),
  storeId: z.coerce.number().int().positive().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CreateVisitorInput = z.infer<typeof createVisitorSchema>;
export type UpdateVisitorInput = z.infer<typeof updateVisitorSchema>;
export type VisitorQueryInput = z.infer<typeof visitorQuerySchema>;
