/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[midtransOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CUSTOMER';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "midtransOrderId" TEXT,
ADD COLUMN     "snaptoken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_midtransOrderId_key" ON "Order"("midtransOrderId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
