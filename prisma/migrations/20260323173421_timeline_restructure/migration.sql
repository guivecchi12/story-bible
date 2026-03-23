/*
  Warnings:

  - You are about to drop the column `timelineEventId` on the `PlotEvent` table. All the data in the column will be lost.
  - You are about to drop the `TimelineEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimelineEventCharacter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlotEvent" DROP CONSTRAINT "PlotEvent_timelineEventId_fkey";

-- DropForeignKey
ALTER TABLE "TimelineEvent" DROP CONSTRAINT "TimelineEvent_bookId_fkey";

-- DropForeignKey
ALTER TABLE "TimelineEvent" DROP CONSTRAINT "TimelineEvent_locationId_fkey";

-- DropForeignKey
ALTER TABLE "TimelineEventCharacter" DROP CONSTRAINT "TimelineEventCharacter_characterId_fkey";

-- DropForeignKey
ALTER TABLE "TimelineEventCharacter" DROP CONSTRAINT "TimelineEventCharacter_timelineEventId_fkey";

-- AlterTable
ALTER TABLE "PlotEvent" DROP COLUMN "timelineEventId";

-- DropTable
DROP TABLE "TimelineEvent";

-- DropTable
DROP TABLE "TimelineEventCharacter";

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "inWorldDate" TEXT,
    "era" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "plotEventId" TEXT NOT NULL,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineCharacterState" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "customStatus" TEXT,
    "description" TEXT,
    "notes" TEXT,

    CONSTRAINT "TimelineCharacterState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineItemState" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "customStatus" TEXT,
    "holderId" TEXT,
    "locationId" TEXT,
    "notes" TEXT,

    CONSTRAINT "TimelineItemState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineFactionState" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "customStatus" TEXT,
    "description" TEXT,
    "notes" TEXT,

    CONSTRAINT "TimelineFactionState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineLocationState" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "customStatus" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "rulerFactionId" TEXT,

    CONSTRAINT "TimelineLocationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineCharacterMotivation" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "motivationId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "personalNotes" TEXT,

    CONSTRAINT "TimelineCharacterMotivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineFactionMotivation" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "motivationId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,

    CONSTRAINT "TimelineFactionMotivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineCharacterPower" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "powerId" TEXT NOT NULL,
    "strengthLevel" INTEGER NOT NULL DEFAULT 5,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "TimelineCharacterPower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineCharacterLocation" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "TimelineCharacterLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineCharacterItem" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "acquiredAt" TEXT,

    CONSTRAINT "TimelineCharacterItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Timeline_plotEventId_idx" ON "Timeline"("plotEventId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineCharacterState_timelineId_characterId_key" ON "TimelineCharacterState"("timelineId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineItemState_timelineId_itemId_key" ON "TimelineItemState"("timelineId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineFactionState_timelineId_factionId_key" ON "TimelineFactionState"("timelineId", "factionId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineLocationState_timelineId_locationId_key" ON "TimelineLocationState"("timelineId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineCharacterMotivation_timelineId_characterId_motivati_key" ON "TimelineCharacterMotivation"("timelineId", "characterId", "motivationId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineFactionMotivation_timelineId_factionId_motivationId_key" ON "TimelineFactionMotivation"("timelineId", "factionId", "motivationId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineCharacterPower_timelineId_characterId_powerId_key" ON "TimelineCharacterPower"("timelineId", "characterId", "powerId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineCharacterLocation_timelineId_characterId_locationId_key" ON "TimelineCharacterLocation"("timelineId", "characterId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineCharacterItem_timelineId_characterId_itemId_key" ON "TimelineCharacterItem"("timelineId", "characterId", "itemId");

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_plotEventId_fkey" FOREIGN KEY ("plotEventId") REFERENCES "PlotEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterState" ADD CONSTRAINT "TimelineCharacterState_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterState" ADD CONSTRAINT "TimelineCharacterState_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineItemState" ADD CONSTRAINT "TimelineItemState_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineItemState" ADD CONSTRAINT "TimelineItemState_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineItemState" ADD CONSTRAINT "TimelineItemState_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineItemState" ADD CONSTRAINT "TimelineItemState_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineFactionState" ADD CONSTRAINT "TimelineFactionState_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineFactionState" ADD CONSTRAINT "TimelineFactionState_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineLocationState" ADD CONSTRAINT "TimelineLocationState_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineLocationState" ADD CONSTRAINT "TimelineLocationState_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineLocationState" ADD CONSTRAINT "TimelineLocationState_rulerFactionId_fkey" FOREIGN KEY ("rulerFactionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterMotivation" ADD CONSTRAINT "TimelineCharacterMotivation_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterMotivation" ADD CONSTRAINT "TimelineCharacterMotivation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterMotivation" ADD CONSTRAINT "TimelineCharacterMotivation_motivationId_fkey" FOREIGN KEY ("motivationId") REFERENCES "Motivation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineFactionMotivation" ADD CONSTRAINT "TimelineFactionMotivation_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineFactionMotivation" ADD CONSTRAINT "TimelineFactionMotivation_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineFactionMotivation" ADD CONSTRAINT "TimelineFactionMotivation_motivationId_fkey" FOREIGN KEY ("motivationId") REFERENCES "Motivation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterPower" ADD CONSTRAINT "TimelineCharacterPower_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterPower" ADD CONSTRAINT "TimelineCharacterPower_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterPower" ADD CONSTRAINT "TimelineCharacterPower_powerId_fkey" FOREIGN KEY ("powerId") REFERENCES "Power"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterLocation" ADD CONSTRAINT "TimelineCharacterLocation_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterLocation" ADD CONSTRAINT "TimelineCharacterLocation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterLocation" ADD CONSTRAINT "TimelineCharacterLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterItem" ADD CONSTRAINT "TimelineCharacterItem_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterItem" ADD CONSTRAINT "TimelineCharacterItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterItem" ADD CONSTRAINT "TimelineCharacterItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
