ALTER TABLE "expenses" ADD COLUMN "updatedBy" INTEGER;

ALTER TABLE "expenses" ADD CONSTRAINT "expenses_updatedBy_fkey"
FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "expenses_updatedBy_idx" ON "expenses"("updatedBy");
