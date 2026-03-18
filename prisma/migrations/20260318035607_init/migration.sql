-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "backstory" TEXT,
    "factionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Power" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effects" TEXT,
    "rules" TEXT,
    "weaknesses" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Power_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterPower" (
    "characterId" TEXT NOT NULL,
    "powerId" TEXT NOT NULL,
    "strengthLevel" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CharacterPower_pkey" PRIMARY KEY ("characterId","powerId")
);

-- CreateTable
CREATE TABLE "Motivation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Motivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterMotivation" (
    "characterId" TEXT NOT NULL,
    "motivationId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "personalNotes" TEXT,

    CONSTRAINT "CharacterMotivation_pkey" PRIMARY KEY ("characterId","motivationId")
);

-- CreateTable
CREATE TABLE "FactionMotivation" (
    "factionId" TEXT NOT NULL,
    "motivationId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,

    CONSTRAINT "FactionMotivation_pkey" PRIMARY KEY ("factionId","motivationId")
);

-- CreateTable
CREATE TABLE "Faction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "climate" TEXT,
    "culture" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterLocation" (
    "characterId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "CharacterLocation_pkey" PRIMARY KEY ("characterId","locationId")
);

-- CreateTable
CREATE TABLE "StoryArc" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "parentArcId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryArc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlotEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "consequence" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "storyArcId" TEXT NOT NULL,
    "locationId" TEXT,
    "timelineEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlotEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlotEventCharacter" (
    "plotEventId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "PlotEventCharacter_pkey" PRIMARY KEY ("plotEventId","characterId")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "inWorldDate" TEXT,
    "era" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEventCharacter" (
    "timelineEventId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "TimelineEventCharacter_pkey" PRIMARY KEY ("timelineEventId","characterId")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "lore" TEXT,
    "properties" TEXT,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterItem" (
    "characterId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "acquiredAt" TEXT,

    CONSTRAINT "CharacterItem_pkey" PRIMARY KEY ("characterId","itemId")
);

-- CreateTable
CREATE TABLE "PlotEventItem" (
    "plotEventId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "PlotEventItem_pkey" PRIMARY KEY ("plotEventId","itemId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPower" ADD CONSTRAINT "CharacterPower_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPower" ADD CONSTRAINT "CharacterPower_powerId_fkey" FOREIGN KEY ("powerId") REFERENCES "Power"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterMotivation" ADD CONSTRAINT "CharacterMotivation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterMotivation" ADD CONSTRAINT "CharacterMotivation_motivationId_fkey" FOREIGN KEY ("motivationId") REFERENCES "Motivation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactionMotivation" ADD CONSTRAINT "FactionMotivation_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactionMotivation" ADD CONSTRAINT "FactionMotivation_motivationId_fkey" FOREIGN KEY ("motivationId") REFERENCES "Motivation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterLocation" ADD CONSTRAINT "CharacterLocation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterLocation" ADD CONSTRAINT "CharacterLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryArc" ADD CONSTRAINT "StoryArc_parentArcId_fkey" FOREIGN KEY ("parentArcId") REFERENCES "StoryArc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotEvent" ADD CONSTRAINT "PlotEvent_storyArcId_fkey" FOREIGN KEY ("storyArcId") REFERENCES "StoryArc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotEvent" ADD CONSTRAINT "PlotEvent_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotEvent" ADD CONSTRAINT "PlotEvent_timelineEventId_fkey" FOREIGN KEY ("timelineEventId") REFERENCES "TimelineEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotEventCharacter" ADD CONSTRAINT "PlotEventCharacter_plotEventId_fkey" FOREIGN KEY ("plotEventId") REFERENCES "PlotEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotEventCharacter" ADD CONSTRAINT "PlotEventCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEventCharacter" ADD CONSTRAINT "TimelineEventCharacter_timelineEventId_fkey" FOREIGN KEY ("timelineEventId") REFERENCES "TimelineEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEventCharacter" ADD CONSTRAINT "TimelineEventCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterItem" ADD CONSTRAINT "CharacterItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterItem" ADD CONSTRAINT "CharacterItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotEventItem" ADD CONSTRAINT "PlotEventItem_plotEventId_fkey" FOREIGN KEY ("plotEventId") REFERENCES "PlotEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotEventItem" ADD CONSTRAINT "PlotEventItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
