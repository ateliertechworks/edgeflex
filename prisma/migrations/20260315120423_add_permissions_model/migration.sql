-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "owner_id" TEXT NOT NULL,
    "owner_email" TEXT,
    "shared_with_email" TEXT NOT NULL,
    "access_level" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "permissions_owner_id_idx" ON "permissions"("owner_id");

-- CreateIndex
CREATE INDEX "permissions_shared_with_email_idx" ON "permissions"("shared_with_email");
