-- Beksar Stage 1: Status manual imports.
-- Reuses the existing import_log table; does not create import_logs.

ALTER TABLE "import_log"
ADD COLUMN IF NOT EXISTS "fileHash" TEXT;

CREATE INDEX IF NOT EXISTS "import_log_fileHash_idx"
ON "import_log"("fileHash");

CREATE UNIQUE INDEX IF NOT EXISTS "import_log_fileHash_storeId_sourceType_key"
ON "import_log"("fileHash", "storeId", "sourceType")
WHERE "fileHash" IS NOT NULL AND "storeId" IS NOT NULL;
