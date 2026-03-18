import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { storyArcService } from "@/lib/services";
import { storyArcSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const arcs = await storyArcService.getAll(ctx.bookId);
  return NextResponse.json(arcs);
}

export async function POST(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.role === "viewer")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const parsed = storyArcSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    const arc = await storyArcService.create(parsed.data, ctx.bookId);
    return NextResponse.json(arc, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
