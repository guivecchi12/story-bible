import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getBookContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.invitation.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }
}
