CREATE TABLE "advertising_expenses" (
  "id" SERIAL NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "storeId" INTEGER,
  "storeName" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL,
  "description" TEXT,
  "fileName" TEXT NOT NULL,
  "fileHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "advertising_expenses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "advertising_expenses_fileHash_date_storeName_source_key"
ON "advertising_expenses"("fileHash", "date", "storeName", "source");

CREATE INDEX "advertising_expenses_date_idx"
ON "advertising_expenses"("date");

CREATE INDEX "advertising_expenses_storeId_idx"
ON "advertising_expenses"("storeId");

CREATE INDEX "advertising_expenses_fileHash_idx"
ON "advertising_expenses"("fileHash");

ALTER TABLE "advertising_expenses"
ADD CONSTRAINT "advertising_expenses_storeId_fkey"
FOREIGN KEY ("storeId") REFERENCES "stores"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
