import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { type } = await req.json();
    let data: unknown;

    switch (type) {
      case "character-sheet":
        data = await prisma.character.findMany({
          include: {
            faction: true,
            powers: { include: { power: true } },
            motivations: { include: { motivation: true } },
            locations: { include: { location: true } },
            items: { include: { item: true } },
          },
          orderBy: { name: "asc" },
        });
        break;

      case "timeline":
        data = await prisma.timelineEvent.findMany({
          include: {
            location: true,
            characters: { include: { character: true } },
          },
          orderBy: { order: "asc" },
        });
        break;

      case "story-arc":
        data = await prisma.storyArc.findMany({
          include: {
            subPlots: true,
            plotEvents: {
              include: {
                characters: { include: { character: true } },
                location: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { title: "asc" },
        });
        break;

      case "world-summary":
        data = await prisma.location.findMany({
          include: {
            parent: true,
            children: true,
          },
          orderBy: { name: "asc" },
        });
        break;

      case "faction":
        data = await prisma.faction.findMany({
          include: {
            characters: true,
            motivations: { include: { motivation: true } },
          },
          orderBy: { name: "asc" },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 },
        );
    }

    return NextResponse.json({
      type,
      data,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
