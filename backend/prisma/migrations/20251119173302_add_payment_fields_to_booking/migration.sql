-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ONSITE', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "card_last4" VARCHAR(4),
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'ONSITE',
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "bookings_payment_status_idx" ON "bookings"("payment_status");
