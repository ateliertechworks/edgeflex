-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "user_id" TEXT NOT NULL DEFAULT 'unknown';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "user_id" TEXT NOT NULL DEFAULT 'unknown';

-- CreateIndex
CREATE INDEX "customers_user_id_idx" ON "customers"("user_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
