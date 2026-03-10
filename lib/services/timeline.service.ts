import { prisma } from "@/lib/db";
import { TimelineEventInput } from "@/lib/validation";

export const timelineService = {
  async getAll() {
    return prisma.timelineEvent.findMany({
      include: {
        location: true,
        characters: { include: { character: true } },
        plotEvents: true,
      },
      orderBy: { order: "asc" },
    });
  },

  async getById(id: string) {
    return prisma.timelineEvent.findUnique({
      where: { id },
      include: {
        location: true,
        characters: { include: { character: true } },
        plotEvents: { include: { storyArc: true } },
      },
    });
  },

  async create(data: TimelineEventInput) {
    return prisma.timelineEvent.create({ data });
  },

  async update(id: string, data: Partial<TimelineEventInput>) {
    return prisma.timelineEvent.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.timelineEvent.delete({ where: { id } });
  },

  async addCharacter(timelineEventId: string, characterId: string, notes?: string) {
    return prisma.timelineEventCharacter.create({
      data: { timelineEventId, characterId, notes },
    });
  },

  async removeCharacter(timelineEventId: string, characterId: string) {
    return prisma.timelineEventCharacter.delete({
      where: { timelineEventId_characterId: { timelineEventId, characterId } },
    });
  },
};
