import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { plotEventService } from "@/lib/services";

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
    const { characterId, role } = await req.json();
    if (!characterId || !role)
      return NextResponse.json(
        { error: "characterId and role are required" },
        { status: 400 },
      );
    const result = await plotEventService.addCharacter(
      params.id,
      characterId,
      role,
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
    await plotEventService.removeCharacter(params.id, characterId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
