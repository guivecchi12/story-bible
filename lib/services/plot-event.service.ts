import { prisma } from "@/lib/db";
import { PlotEventInput } from "@/lib/validation";

export const plotEventService = {
  async getAll(bookId: string) {
    return prisma.plotEvent.findMany({
      where: { bookId },
      include: {
        storyArc: true,
        location: true,
        timelineEvent: true,
        characters: { include: { character: true } },
        items: { include: { item: true } },
      },
      orderBy: { order: "asc" },
    });
  },

  async getById(id: string) {
    return prisma.plotEvent.findUnique({
      where: { id },
      include: {
        storyArc: true,
        location: true,
        timelineEvent: true,
        characters: { include: { character: true } },
        items: { include: { item: true } },
      },
    });
  },

  async create(data: PlotEventInput, bookId: string) {
    return prisma.plotEvent.create({
      data: { ...data, bookId },
      include: { storyArc: true },
    });
  },

  async update(id: string, data: Partial<PlotEventInput>) {
    return prisma.plotEvent.update({
      where: { id },
      data,
      include: { storyArc: true },
    });
  },

  async delete(id: string) {
    return prisma.plotEvent.delete({ where: { id } });
  },

  async addCharacter(plotEventId: string, characterId: string, role: string) {
    return prisma.plotEventCharacter.create({
      data: { plotEventId, characterId, role },
    });
  },

  async removeCharacter(plotEventId: string, characterId: string) {
    return prisma.plotEventCharacter.delete({
      where: { plotEventId_characterId: { plotEventId, characterId } },
    });
  },

  async addItem(plotEventId: string, itemId: string, role: string) {
    return prisma.plotEventItem.create({
      data: { plotEventId, itemId, role },
    });
  },

  async removeItem(plotEventId: string, itemId: string) {
    return prisma.plotEventItem.delete({
      where: { plotEventId_itemId: { plotEventId, itemId } },
    });
  },
};
