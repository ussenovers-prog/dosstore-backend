"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    // Database
    DATABASE_URL: zod_1.z.string(),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_ACCESS_EXPIRES: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES: zod_1.z.string().default('7d'),
    // Bcrypt
    BCRYPT_ROUNDS: zod_1.z.coerce.number().int().min(10).max(15).default(12),
    // Server
    PORT: zod_1.z.coerce.number().int().default(3001),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // FTP
    FTP_HOST: zod_1.z.string().optional(),
    FTP_PORT: zod_1.z.coerce.number().int().default(21),
    FTP_USER: zod_1.z.string().optional(),
    FTP_PASS: zod_1.z.string().optional(),
    FTP_SALES_PATH: zod_1.z.string().default('/sales/'),
    FTP_ARRIVAL_PATH: zod_1.z.string().default('/arrivals/'),
    FTP_INVENTORY_PATH: zod_1.z.string().default('/inventory/'),
    FTP_GROSS_PROFIT_PATH: zod_1.z.string().default('/gross_profit/'),
    FTP_ARCHIVE_PATH: zod_1.z.string().default('/archive/'),
    FTP_POLL_INTERVAL_MS: zod_1.z.coerce.number().int().default(300000),
    // Google Sheets
    GOOGLE_SHEETS_CREDENTIALS_PATH: zod_1.z.string().optional(),
    GOOGLE_SHEETS_AD_SPREADSHEET_ID: zod_1.z.string().optional(),
    GOOGLE_SHEETS_AD_RANGE: zod_1.z.string().default('Sheet1!A:F'),
    GOOGLE_SHEETS_SYNC_INTERVAL_MS: zod_1.z.coerce.number().int().default(3600000),
});
function loadEnv() {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        console.error(result.error.format());
        process.exit(1);
    }
    return result.data;
}
exports.env = loadEnv();
//# sourceMappingURL=env.js.map