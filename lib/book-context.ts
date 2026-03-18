import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getBookContext(req?: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as any).id;

  // Get bookId from request header or user's active book
  const bookId = req?.headers.get("x-book-id")
    ?? (await prisma.user.findUnique({ where: { id: userId }, select: { activeBookId: true } }))?.activeBookId;

  if (!bookId) return null;

  const membership = await prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId, userId } },
  });
  if (!membership) return null;

  return { session, userId, bookId, role: membership.role };
}
