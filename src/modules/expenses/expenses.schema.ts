import { z } from 'zod';

export const createExpenseSchema = z.object({
  storeId: z.number().int().positive(),
  category: z.enum(['salary', 'rent', 'utilities', 'target_ads', 'other']),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  isRecurring: z.boolean().default(false),
  source: z.string().optional(),
  campaignName: z.string().optional(),
  channel: z.string().optional(),
});

export const updateExpenseSchema = z.object({
  category: z.enum(['salary', 'rent', 'utilities', 'target_ads', 'other']).optional(),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  isRecurring: z.boolean().optional(),
  campaignName: z.string().optional(),
  channel: z.string().optional(),
});

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(50),
  storeId: z.coerce.number().int().positive().optional(),
  category: z.enum(['salary', 'rent', 'utilities', 'target_ads', 'other']).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isRecurring: z.coerce.boolean().optional(),
  source: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
