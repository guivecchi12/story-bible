import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { bookId } = await req.json();

  // Verify membership
  const membership = await prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId, userId } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member of this book" }, { status: 403 });

  await prisma.user.update({
    where: { id: userId },
    data: { activeBookId: bookId },
  });

  return NextResponse.json({ bookId });
}
