import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.role === "viewer")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { characterId, factionId, role } = await req.json();
    if (!characterId || !factionId)
      return NextResponse.json({ error: "characterId and factionId are required" }, { status: 400 });

    // Also mark factionsOverridden on the character state
    await prisma.timelineCharacterState.upsert({
      where: { timelineId_characterId: { timelineId: params.id, characterId } },
      update: { factionsOverridden: true },
      create: { timelineId: params.id, characterId, factionsOverridden: true },
    });

    const result = await prisma.timelineCharacterFaction.upsert({
      where: { timelineId_characterId_factionId: { timelineId: params.id, characterId, factionId } },
      update: { role },
      create: { timelineId: params.id, characterId, factionId, role },
    });
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.role === "viewer")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { characterId, factionId } = await req.json();
    if (!characterId || !factionId)
      return NextResponse.json({ error: "characterId and factionId are required" }, { status: 400 });

    // Check if this faction exists in the timeline table
    const existing = await prisma.timelineCharacterFaction.findUnique({
      where: { timelineId_characterId_factionId: { timelineId: params.id, characterId, factionId } },
    });

    if (existing) {
      // Faction was added in this timeline — just delete it
      await prisma.timelineCharacterFaction.delete({
        where: { timelineId_characterId_factionId: { timelineId: params.id, characterId, factionId } },
      });
    } else {
      // Faction comes from the base table — we need to copy all base factions
      // to the timeline EXCEPT the one being removed, then mark as overridden
      const baseFactions = await prisma.characterFaction.findMany({
        where: { characterId },
      });

      // Ensure factionsOverridden is set
      await prisma.timelineCharacterState.upsert({
        where: { timelineId_characterId: { timelineId: params.id, characterId } },
        update: { factionsOverridden: true },
        create: { timelineId: params.id, characterId, factionsOverridden: true },
      });

      // Delete any existing timeline factions for this character, then recreate without the removed one
      await prisma.timelineCharacterFaction.deleteMany({
        where: { timelineId: params.id, characterId },
      });

      const remaining = baseFactions.filter((f) => f.factionId !== factionId);
      if (remaining.length > 0) {
        await prisma.timelineCharacterFaction.createMany({
          data: remaining.map((f) => ({
            timelineId: params.id,
            characterId,
            factionId: f.factionId,
            role: f.role,
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
