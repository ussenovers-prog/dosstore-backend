import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  storeId: z.coerce.number().int().positive().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
  limit: z.coerce.number().int().positive().max(500).optional(),
});

export const topProductsQuerySchema = z.object({
  storeId: z.coerce.number().int().positive().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const abcAnalysisQuerySchema = z.object({
  storeId: z.coerce.number().int().positive().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
export type TopProductsQueryInput = z.infer<typeof topProductsQuerySchema>;
export type AbcAnalysisQueryInput = z.infer<typeof abcAnalysisQuerySchema>;
