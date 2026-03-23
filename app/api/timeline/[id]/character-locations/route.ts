import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { timelineService } from "@/lib/services";
import { timelineCharacterLocationSchema } from "@/lib/validation";
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
    const parsed = timelineCharacterLocationSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    const result = await timelineService.setCharacterLocation(params.id, parsed.data);
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
    const { characterId, locationId } = await req.json();
    if (!characterId || !locationId)
      return NextResponse.json({ error: "characterId and locationId are required" }, { status: 400 });

    const existing = await prisma.timelineCharacterLocation.findUnique({
      where: { timelineId_characterId_locationId: { timelineId: params.id, characterId, locationId } },
    });

    if (existing) {
      await prisma.timelineCharacterLocation.delete({
        where: { timelineId_characterId_locationId: { timelineId: params.id, characterId, locationId } },
      });
    } else {
      const baseLocations = await prisma.characterLocation.findMany({ where: { characterId } });
      await prisma.timelineCharacterLocation.deleteMany({ where: { timelineId: params.id, characterId } });
      const remaining = baseLocations.filter((l) => l.locationId !== locationId);
      if (remaining.length > 0) {
        await prisma.timelineCharacterLocation.createMany({
          data: remaining.map((l) => ({
            timelineId: params.id, characterId, locationId: l.locationId, role: l.role,
          })),
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
