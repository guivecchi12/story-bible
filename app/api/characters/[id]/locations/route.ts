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
    const { locationId, role } = await req.json();
    if (!locationId || !role)
      return NextResponse.json(
        { error: "locationId and role are required" },
        { status: 400 },
      );
    const result = await characterService.addLocation(
      params.id,
      locationId,
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
    const { locationId } = await req.json();
    if (!locationId)
      return NextResponse.json(
        { error: "locationId is required" },
        { status: 400 },
      );
    await characterService.removeLocation(params.id, locationId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
