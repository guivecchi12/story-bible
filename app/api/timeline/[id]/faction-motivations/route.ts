import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { timelineService } from "@/lib/services";
import { timelineFactionMotivationSchema } from "@/lib/validation";
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
    const parsed = timelineFactionMotivationSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    const result = await timelineService.setFactionMotivation(params.id, parsed.data);
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
    const { factionId, motivationId } = await req.json();
    if (!factionId || !motivationId)
      return NextResponse.json({ error: "factionId and motivationId are required" }, { status: 400 });

    const existing = await prisma.timelineFactionMotivation.findUnique({
      where: { timelineId_factionId_motivationId: { timelineId: params.id, factionId, motivationId } },
    });

    if (existing) {
      await prisma.timelineFactionMotivation.delete({
        where: { timelineId_factionId_motivationId: { timelineId: params.id, factionId, motivationId } },
      });
    } else {
      // Copy base motivations to timeline minus the removed one
      const baseMotivations = await prisma.factionMotivation.findMany({ where: { factionId } });
      await prisma.timelineFactionMotivation.deleteMany({ where: { timelineId: params.id, factionId } });
      const remaining = baseMotivations.filter((m) => m.motivationId !== motivationId);
      if (remaining.length > 0) {
        await prisma.timelineFactionMotivation.createMany({
          data: remaining.map((m) => ({
            timelineId: params.id, factionId, motivationId: m.motivationId,
            priority: m.priority, notes: m.notes,
          })),
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
