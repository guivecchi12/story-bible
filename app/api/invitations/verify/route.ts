import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation || invitation.usedAt || new Date(invitation.expiresAt) <= new Date()) {
    return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
  }

  return NextResponse.json({ email: invitation.email, role: invitation.role });
}
