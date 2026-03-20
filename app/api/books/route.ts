import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeBookId: true },
  });

  const memberships = await prisma.bookMember.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { book: { name: "asc" } },
  });

  const books = memberships.map(
    (m: {
      book: { id: string; name: string; description: string | null };
      role: string;
    }) => ({
      id: m.book.id,
      name: m.book.name,
      description: m.book.description,
      role: m.role,
    }),
  );

  return NextResponse.json({ books, activeBookId: user?.activeBookId });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, description } = await req.json();
    if (!name?.trim())
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const userId = (session.user as any).id;

    const book = await prisma.book.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        members: { create: { userId, role: "owner" } },
      },
    });

    // Set as active book
    await prisma.user.update({
      where: { id: userId },
      data: { activeBookId: book.id },
    });

    return NextResponse.json(book, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
