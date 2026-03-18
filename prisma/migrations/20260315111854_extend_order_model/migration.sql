/*
  Warnings:

  - You are about to drop the column `total_amount` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "total_amount",
ADD COLUMN     "branch_id" INTEGER,
ADD COLUMN     "conversion_rate" DOUBLE PRECISION DEFAULT 1.0,
ADD COLUMN     "product_code" TEXT,
ADD COLUMN     "product_type" TEXT,
ADD COLUMN     "quantity" INTEGER,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "tax_amount" DOUBLE PRECISION,
ADD COLUMN     "total_price" DOUBLE PRECISION,
ADD COLUMN     "unit_price" DOUBLE PRECISION,
ADD COLUMN     "unit_price_inr" DOUBLE PRECISION,
ADD COLUMN     "year" INTEGER;
