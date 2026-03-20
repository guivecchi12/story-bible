import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { timelineService } from "@/lib/services";

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
    const { characterId, notes } = await req.json();
    if (!characterId)
      return NextResponse.json(
        { error: "characterId is required" },
        { status: 400 },
      );
    const result = await timelineService.addCharacter(
      params.id,
      characterId,
      notes,
    );
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
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
    const { characterId } = await req.json();
    if (!characterId)
      return NextResponse.json(
        { error: "characterId is required" },
        { status: 400 },
      );
    await timelineService.removeCharacter(params.id, characterId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
