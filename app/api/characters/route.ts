import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { characterService } from "@/lib/services";
import { characterSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const characters = await characterService.getAll(ctx.bookId);
  return NextResponse.json(characters);
}

export async function POST(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.role === "viewer")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const parsed = characterSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    const character = await characterService.create(parsed.data, ctx.bookId);
    return NextResponse.json(character, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
