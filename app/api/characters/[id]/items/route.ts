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
    const { itemId, status, acquiredAt } = await req.json();
    if (!itemId || !status)
      return NextResponse.json(
        { error: "itemId and status are required" },
        { status: 400 },
      );
    const result = await characterService.addItem(
      params.id,
      itemId,
      status,
      acquiredAt,
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
    const { itemId } = await req.json();
    if (!itemId)
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 },
      );
    await characterService.removeItem(params.id, itemId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
