import { prisma } from "@/lib/db";

export const searchService = {
  async globalSearch(query: string, bookId: string) {
    const [
      characters,
      powers,
      motivations,
      factions,
      locations,
      storyArcs,
      plotEvents,
      timelineEvents,
      items,
    ] = await Promise.all([
      prisma.character.findMany({
        where: { name: { contains: query, mode: "insensitive" }, bookId },
        select: { id: true, name: true, type: true },
      }),
      prisma.power.findMany({
        where: { name: { contains: query, mode: "insensitive" }, bookId },
        select: { id: true, name: true },
      }),
      prisma.motivation.findMany({
        where: { name: { contains: query, mode: "insensitive" }, bookId },
        select: { id: true, name: true, category: true },
      }),
      prisma.faction.findMany({
        where: { name: { contains: query, mode: "insensitive" }, bookId },
        select: { id: true, name: true },
      }),
      prisma.location.findMany({
        where: { name: { contains: query, mode: "insensitive" }, bookId },
        select: { id: true, name: true, type: true },
      }),
      prisma.storyArc.findMany({
        where: { title: { contains: query, mode: "insensitive" }, bookId },
        select: { id: true, title: true, type: true, status: true },
      }),
      prisma.plotEvent.findMany({
        where: { title: { contains: query, mode: "insensitive" }, bookId },
        select: { id: true, title: true },
      }),
      prisma.timelineEvent.findMany({
        where: { title: { contains: query, mode: "insensitive" }, bookId },
        select: { id: true, title: true, era: true },
      }),
      prisma.item.findMany({
        where: { name: { contains: query, mode: "insensitive" }, bookId },
        select: { id: true, name: true, type: true },
      }),
    ]);

    return {
      characters: characters.map((c) => ({
        ...c,
        entityType: "character" as const,
      })),
      powers: powers.map((p) => ({ ...p, entityType: "power" as const })),
      motivations: motivations.map((m) => ({
        ...m,
        entityType: "motivation" as const,
      })),
      factions: factions.map((f) => ({ ...f, entityType: "faction" as const })),
      locations: locations.map((l) => ({
        ...l,
        entityType: "location" as const,
      })),
      storyArcs: storyArcs.map((s) => ({
        ...s,
        entityType: "story-arc" as const,
      })),
      plotEvents: plotEvents.map((p) => ({
        ...p,
        entityType: "plot-event" as const,
      })),
      timelineEvents: timelineEvents.map((t) => ({
        ...t,
        entityType: "timeline" as const,
      })),
      items: items.map((i) => ({ ...i, entityType: "item" as const })),
    };
  },
};
