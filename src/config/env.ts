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
  PUBLIC_APP_URL: z.string().url().default('https://dosstore-backend.onrender.com'),
  KEEP_ALIVE_ENABLED: z.string().default('true').transform((value) => value.toLowerCase() === 'true'),
  KEEP_ALIVE_INTERVAL_MS: z.coerce.number().int().positive().default(600000),

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

  // Store-specific Beksar FTP sync
  FTP_SYNC_ENABLED: z.string().default('false').transform((value) => value.toLowerCase() === 'true'),
  FTP_SYNC_MIN_FILE_AGE_SECONDS: z.coerce.number().int().nonnegative().default(120),
  STATUS_FTP_HOST: z.string().optional(),
  STATUS_FTP_PORT: z.coerce.number().int().positive().default(22),
  STATUS_FTP_USER: z.string().optional(),
  STATUS_FTP_PASSWORD: z.string().optional(),
  STATUS_FTP_PATH: z.string().optional(),
  STATUS_FTP_PROTOCOL: z.enum(['ftp', 'sftp']).default('sftp'),
  DOSSTORE_FTP_HOST: z.string().optional(),
  DOSSTORE_FTP_PORT: z.coerce.number().int().positive().default(22),
  DOSSTORE_FTP_USER: z.string().optional(),
  DOSSTORE_FTP_PASSWORD: z.string().optional(),
  DOSSTORE_FTP_PATH: z.string().optional(),
  DOSSTORE_FTP_PROTOCOL: z.enum(['ftp', 'sftp']).default('sftp'),

  // Google Sheets
  GOOGLE_SHEETS_CREDENTIALS_PATH: z.string().optional(),
  GOOGLE_SHEETS_AD_SPREADSHEET_ID: z.string().default('1WK4x-u-m9rMXMhtGHAk1KHd4zatgppwMpHjwv9RNZZQ'),
  GOOGLE_SHEETS_AD_GID: z.string().default('2053740277'),
  GOOGLE_SHEETS_AD_SYNC_ENABLED: z.string().default('true').transform((value) => value.toLowerCase() === 'true'),
  GOOGLE_SHEETS_AD_SYNC_INTERVAL_MS: z.coerce.number().int().positive().default(900000),
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
