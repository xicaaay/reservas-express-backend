-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'PAID');

-- DropIndex
DROP INDEX "Reservation_categoryId_startDate_endDate_idx";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING';
