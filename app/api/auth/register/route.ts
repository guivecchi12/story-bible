import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    // Check for a valid invitation
    const invitation = await prisma.invitation.findFirst({
      where: { email, usedAt: null, expiresAt: { gt: new Date() } },
    });

    // If no invitation exists and there are already users, block registration
    const userCount = await prisma.user.count();
    if (!invitation && userCount > 0) {
      return NextResponse.json(
        { error: "Registration requires an invitation" },
        { status: 403 },
      );
    }

    const hashedPassword = await hash(password, 12);

    if (invitation) {
      // Invited user: create user and add to the invitation's book
      const user = await prisma.user.create({
        data: {
          name,
          email,
          hashedPassword,
          activeBookId: invitation.bookId,
        },
      });

      await prisma.bookMember.create({
        data: {
          bookId: invitation.bookId,
          userId: user.id,
          role: invitation.role,
        },
      });

      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      return NextResponse.json(
        { id: user.id, name: user.name, email: user.email },
        { status: 201 },
      );
    } else {
      // First user: create user with a default book
      const user = await prisma.user.create({
        data: { name, email, hashedPassword },
      });

      const book = await prisma.book.create({
        data: {
          name: "My Story Bible",
          members: { create: { userId: user.id, role: "owner" } },
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { activeBookId: book.id },
      });

      return NextResponse.json(
        { id: user.id, name: user.name, email: user.email },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
