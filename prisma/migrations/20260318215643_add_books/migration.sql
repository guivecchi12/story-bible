/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `bookId` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookId` to the `Faction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookId` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookId` to the `Motivation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookId` to the `PlotEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookId` to the `Power` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookId` to the `StoryArc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookId` to the `TimelineEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Faction" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Motivation" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PlotEvent" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Power" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StoryArc" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "activeBookId" TEXT,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookMember" (
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookMember_pkey" PRIMARY KEY ("bookId","userId")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "token" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE INDEX "Character_bookId_idx" ON "Character"("bookId");

-- CreateIndex
CREATE INDEX "Faction_bookId_idx" ON "Faction"("bookId");

-- CreateIndex
CREATE INDEX "Item_bookId_idx" ON "Item"("bookId");

-- CreateIndex
CREATE INDEX "Location_bookId_idx" ON "Location"("bookId");

-- CreateIndex
CREATE INDEX "Motivation_bookId_idx" ON "Motivation"("bookId");

-- CreateIndex
CREATE INDEX "PlotEvent_bookId_idx" ON "PlotEvent"("bookId");

-- CreateIndex
CREATE INDEX "Power_bookId_idx" ON "Power"("bookId");

-- CreateIndex
CREATE INDEX "StoryArc_bookId_idx" ON "StoryArc"("bookId");

-- CreateIndex
CREATE INDEX "TimelineEvent_bookId_idx" ON "TimelineEvent"("bookId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeBookId_fkey" FOREIGN KEY ("activeBookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookMember" ADD CONSTRAINT "BookMember_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookMember" ADD CONSTRAINT "BookMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Power" ADD CONSTRAINT "Power_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motivation" ADD CONSTRAINT "Motivation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faction" ADD CONSTRAINT "Faction_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryArc" ADD CONSTRAINT "StoryArc_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotEvent" ADD CONSTRAINT "PlotEvent_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
