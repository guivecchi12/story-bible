/*
  Warnings:

  - You are about to drop the column `factionId` on the `Character` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_factionId_fkey";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "factionId",
ADD COLUMN     "nicknames" TEXT[];

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "aliases" TEXT[];

-- AlterTable
ALTER TABLE "TimelineCharacterState" ADD COLUMN     "backstory" TEXT,
ADD COLUMN     "factionsOverridden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "nicknames" TEXT[],
ADD COLUMN     "nicknamesOverridden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TimelineFactionState" ADD COLUMN     "name" TEXT,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TimelineItemState" ADD COLUMN     "aliases" TEXT[],
ADD COLUMN     "aliasesOverridden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "lore" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "properties" TEXT,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TimelineLocationState" ADD COLUMN     "climate" TEXT,
ADD COLUMN     "culture" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "status" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CharacterFaction" (
    "characterId" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "CharacterFaction_pkey" PRIMARY KEY ("characterId","factionId")
);

-- CreateTable
CREATE TABLE "TimelineCharacterFaction" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "TimelineCharacterFaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimelineCharacterFaction_timelineId_characterId_factionId_key" ON "TimelineCharacterFaction"("timelineId", "characterId", "factionId");

-- AddForeignKey
ALTER TABLE "CharacterFaction" ADD CONSTRAINT "CharacterFaction_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFaction" ADD CONSTRAINT "CharacterFaction_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterFaction" ADD CONSTRAINT "TimelineCharacterFaction_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterFaction" ADD CONSTRAINT "TimelineCharacterFaction_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineCharacterFaction" ADD CONSTRAINT "TimelineCharacterFaction_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
