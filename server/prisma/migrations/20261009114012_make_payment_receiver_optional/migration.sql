-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_receivedById_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "receivedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
