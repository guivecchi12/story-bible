import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { timelineService } from "@/lib/services";
import { timelineCharacterPowerSchema } from "@/lib/validation";
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
    const body = await req.json();
    const parsed = timelineCharacterPowerSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    const result = await timelineService.setCharacterPower(params.id, parsed.data);
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
    const { characterId, powerId } = await req.json();
    if (!characterId || !powerId)
      return NextResponse.json({ error: "characterId and powerId are required" }, { status: 400 });

    const existing = await prisma.timelineCharacterPower.findUnique({
      where: { timelineId_characterId_powerId: { timelineId: params.id, characterId, powerId } },
    });

    if (existing) {
      await prisma.timelineCharacterPower.delete({
        where: { timelineId_characterId_powerId: { timelineId: params.id, characterId, powerId } },
      });
    } else {
      // Copy base powers to timeline minus the removed one
      const basePowers = await prisma.characterPower.findMany({ where: { characterId } });
      await prisma.timelineCharacterPower.deleteMany({ where: { timelineId: params.id, characterId } });
      const remaining = basePowers.filter((p) => p.powerId !== powerId);
      if (remaining.length > 0) {
        await prisma.timelineCharacterPower.createMany({
          data: remaining.map((p) => ({
            timelineId: params.id, characterId, powerId: p.powerId,
            strengthLevel: p.strengthLevel, isPrimary: p.isPrimary, notes: p.notes,
          })),
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
