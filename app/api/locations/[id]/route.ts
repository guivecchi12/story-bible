import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { locationService, mergedEntityService } from "@/lib/services";
import { locationSchema } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const timelineId = url.searchParams.get("timelineId");

  if (timelineId) {
    const merged = await mergedEntityService.getLocation(params.id, timelineId);
    if (!merged)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(merged);
  }

  const location = await locationService.getById(params.id);
  if (!location)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(location);
}

export async function PUT(
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
    const parsed = locationSchema.partial().safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    const location = await locationService.update(params.id, parsed.data);
    return NextResponse.json(location);
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
    await locationService.delete(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
