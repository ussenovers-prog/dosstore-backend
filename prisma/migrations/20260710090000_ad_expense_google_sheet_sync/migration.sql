ALTER TABLE "advertising_expenses"
ADD COLUMN "campaignName" TEXT,
ADD COLUMN "sourceKey" TEXT;

CREATE UNIQUE INDEX "advertising_expenses_sourceKey_key"
ON "advertising_expenses"("sourceKey");
