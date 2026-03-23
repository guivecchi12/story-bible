import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { timelineService } from "@/lib/services";
import { timelineSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const timelines = await timelineService.getAll(ctx.bookId);
  return NextResponse.json(timelines);
}

export async function POST(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.role === "viewer")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const parsed = timelineSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );

    // Find the previous timeline to inherit from
    const previous = await timelineService.findPreviousTimeline(
      parsed.data.plotEventId,
      parsed.data.order,
      ctx.bookId,
    );

    const timeline = await timelineService.create(
      parsed.data,
      previous?.id,
    );
    return NextResponse.json(timeline, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
