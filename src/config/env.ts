import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // Bcrypt
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  // Server
  PORT: z.coerce.number().int().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // FTP
  FTP_HOST: z.string().optional(),
  FTP_PORT: z.coerce.number().int().default(21),
  FTP_USER: z.string().optional(),
  FTP_PASS: z.string().optional(),
  FTP_SALES_PATH: z.string().default('/sales/'),
  FTP_ARRIVAL_PATH: z.string().default('/arrivals/'),
  FTP_INVENTORY_PATH: z.string().default('/inventory/'),
  FTP_GROSS_PROFIT_PATH: z.string().default('/gross_profit/'),
  FTP_ARCHIVE_PATH: z.string().default('/archive/'),
  FTP_POLL_INTERVAL_MS: z.coerce.number().int().default(300000),

  // Google Sheets
  GOOGLE_SHEETS_CREDENTIALS_PATH: z.string().optional(),
  GOOGLE_SHEETS_AD_SPREADSHEET_ID: z.string().optional(),
  GOOGLE_SHEETS_AD_RANGE: z.string().default('Sheet1!A:F'),
  GOOGLE_SHEETS_SYNC_INTERVAL_MS: z.coerce.number().int().default(3600000),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
