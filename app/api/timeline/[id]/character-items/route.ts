import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { timelineService } from "@/lib/services";
import { timelineCharacterItemSchema } from "@/lib/validation";
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
    const parsed = timelineCharacterItemSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    const result = await timelineService.setCharacterItem(params.id, parsed.data);
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
    const { characterId, itemId } = await req.json();
    if (!characterId || !itemId)
      return NextResponse.json({ error: "characterId and itemId are required" }, { status: 400 });

    const existing = await prisma.timelineCharacterItem.findUnique({
      where: { timelineId_characterId_itemId: { timelineId: params.id, characterId, itemId } },
    });

    if (existing) {
      await prisma.timelineCharacterItem.delete({
        where: { timelineId_characterId_itemId: { timelineId: params.id, characterId, itemId } },
      });
    } else {
      const baseItems = await prisma.characterItem.findMany({ where: { characterId } });
      await prisma.timelineCharacterItem.deleteMany({ where: { timelineId: params.id, characterId } });
      const remaining = baseItems.filter((i) => i.itemId !== itemId);
      if (remaining.length > 0) {
        await prisma.timelineCharacterItem.createMany({
          data: remaining.map((i) => ({
            timelineId: params.id, characterId, itemId: i.itemId,
            status: i.status, acquiredAt: i.acquiredAt,
          })),
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
