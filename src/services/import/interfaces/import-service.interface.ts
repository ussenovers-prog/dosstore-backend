import { ImportSource } from '@prisma/client';

export interface ParsedRecord {
  [key: string]: any;
}

export interface ImportMeta {
  sourceType: ImportSource;
  storeId?: number;
  fileName: string;
}

export interface ValidationResult {
  valid: ParsedRecord[];
  errors: Array<{
    record: ParsedRecord;
    error: string;
  }>;
}

export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
}

export interface IImportService {
  /** Parse XML buffer into normalized records */
  parse(buffer: Buffer): Promise<ParsedRecord[]>;

  /** Validate parsed records */
  validate(records: ParsedRecord[]): ValidationResult;

  /** Import validated records into database */
  import(records: ParsedRecord[], meta: ImportMeta): Promise<ImportResult>;
}
