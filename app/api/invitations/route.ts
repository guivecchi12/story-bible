import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { prisma } from "@/lib/db";
import { inviteSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const invitations = await prisma.invitation.findMany({
    where: { bookId: ctx.bookId },
    orderBy: { createdAt: "desc" },
    include: { inviter: { select: { name: true, email: true } } },
  });
  return NextResponse.json(invitations);
}

export async function POST(req: Request) {
  const ctx = await getBookContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

    const { email, role } = parsed.data;

    // Check if user is already a member of this book
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMember = await prisma.bookMember.findUnique({
        where: { bookId_userId: { bookId: ctx.bookId, userId: existingUser.id } },
      });
      if (existingMember) return NextResponse.json({ error: "This user is already a member of this book" }, { status: 409 });
    }

    const existingInvite = await prisma.invitation.findFirst({
      where: { email, bookId: ctx.bookId, usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (existingInvite) return NextResponse.json({ error: "An active invitation already exists for this email" }, { status: 409 });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        bookId: ctx.bookId,
        invitedBy: ctx.userId,
        expiresAt,
      },
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
