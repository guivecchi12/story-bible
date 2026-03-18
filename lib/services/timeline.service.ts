import { prisma } from "@/lib/db";
import { TimelineEventInput } from "@/lib/validation";

export const timelineService = {
  async getAll(bookId: string) {
    return prisma.timelineEvent.findMany({
      where: { bookId },
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

  async create(data: TimelineEventInput, bookId: string) {
    return prisma.timelineEvent.create({ data: { ...data, bookId } });
  },

  async update(id: string, data: Partial<TimelineEventInput>) {
    return prisma.timelineEvent.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.timelineEvent.delete({ where: { id } });
  },

  async addCharacter(
    timelineEventId: string,
    characterId: string,
    notes?: string,
  ) {
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
