-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "rulerFactionId" TEXT;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_rulerFactionId_fkey" FOREIGN KEY ("rulerFactionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
