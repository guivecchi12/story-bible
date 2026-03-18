import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { itemService } from "@/lib/services";
import { itemSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await itemService.getAll(ctx.bookId);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.role === "viewer")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const parsed = itemSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    const item = await itemService.create(parsed.data, ctx.bookId);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
