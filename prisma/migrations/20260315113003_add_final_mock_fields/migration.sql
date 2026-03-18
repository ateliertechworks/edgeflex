-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_date" TIMESTAMP(3),
ADD COLUMN     "invoice_date" TIMESTAMP(3),
ADD COLUMN     "invoice_no" TEXT;
