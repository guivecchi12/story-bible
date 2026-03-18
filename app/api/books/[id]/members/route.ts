import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId: params.id, userId: (session.user as any).id } },
  });
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const members = await prisma.bookMember.findMany({
    where: { bookId: params.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const membership = await prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId: params.id, userId } },
  });
  if (!membership || membership.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { userId: targetUserId } = await req.json();
    if (targetUserId === userId) return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });

    await prisma.bookMember.delete({
      where: { bookId_userId: { bookId: params.id, userId: targetUserId } },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
