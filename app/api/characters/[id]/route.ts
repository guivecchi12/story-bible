import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { characterService } from "@/lib/services";
import { characterSchema } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const character = await characterService.getById(params.id);
  if (!character)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(character);
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
    const parsed = characterSchema.partial().safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    const character = await characterService.update(params.id, parsed.data);
    return NextResponse.json(character);
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
    await characterService.delete(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
