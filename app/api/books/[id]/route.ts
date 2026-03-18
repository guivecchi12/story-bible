import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getMembership(bookId: string, userId: string) {
  return prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId, userId } },
  });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getMembership(params.id, (session.user as any).id);
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  return NextResponse.json(book);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getMembership(params.id, (session.user as any).id);
  if (!membership || membership.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { name, description } = await req.json();
    const book = await prisma.book.update({
      where: { id: params.id },
      data: { name, description },
    });
    return NextResponse.json(book);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getMembership(params.id, (session.user as any).id);
  if (!membership || membership.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.book.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
