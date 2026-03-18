import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { searchService } from "@/lib/services";

export async function GET(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q || q.trim().length === 0) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 },
    );
  }
  const results = await searchService.globalSearch(q.trim(), ctx.bookId);
  return NextResponse.json(results);
}
