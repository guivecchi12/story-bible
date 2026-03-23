import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { timelineService } from "@/lib/services";
import { timelineCharacterMotivationSchema } from "@/lib/validation";
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
    const parsed = timelineCharacterMotivationSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    const result = await timelineService.setCharacterMotivation(params.id, parsed.data);
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
    const { characterId, motivationId } = await req.json();
    if (!characterId || !motivationId)
      return NextResponse.json({ error: "characterId and motivationId are required" }, { status: 400 });

    const existing = await prisma.timelineCharacterMotivation.findUnique({
      where: { timelineId_characterId_motivationId: { timelineId: params.id, characterId, motivationId } },
    });

    if (existing) {
      await prisma.timelineCharacterMotivation.delete({
        where: { timelineId_characterId_motivationId: { timelineId: params.id, characterId, motivationId } },
      });
    } else {
      const baseMotivations = await prisma.characterMotivation.findMany({ where: { characterId } });
      await prisma.timelineCharacterMotivation.deleteMany({ where: { timelineId: params.id, characterId } });
      const remaining = baseMotivations.filter((m) => m.motivationId !== motivationId);
      if (remaining.length > 0) {
        await prisma.timelineCharacterMotivation.createMany({
          data: remaining.map((m) => ({
            timelineId: params.id, characterId, motivationId: m.motivationId,
            priority: m.priority, personalNotes: m.personalNotes,
          })),
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
