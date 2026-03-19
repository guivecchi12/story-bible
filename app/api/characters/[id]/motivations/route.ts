import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { characterService } from "@/lib/services";

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
    const { motivationId, priority, personalNotes } = await req.json();
    if (!motivationId)
      return NextResponse.json(
        { error: "motivationId is required" },
        { status: 400 },
      );
    const result = await characterService.addMotivation(
      params.id,
      motivationId,
      priority ?? 1,
      personalNotes,
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
    const { motivationId } = await req.json();
    if (!motivationId)
      return NextResponse.json(
        { error: "motivationId is required" },
        { status: 400 },
      );
    await characterService.removeMotivation(params.id, motivationId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
