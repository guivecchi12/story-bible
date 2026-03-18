import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { powerService } from "@/lib/services";
import { powerSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const powers = await powerService.getAll(ctx.bookId);
  return NextResponse.json(powers);
}

export async function POST(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.role === "viewer")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const parsed = powerSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    const power = await powerService.create(parsed.data, ctx.bookId);
    return NextResponse.json(power, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
