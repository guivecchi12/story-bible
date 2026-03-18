import { prisma } from "@/lib/db";
import { StoryArcInput } from "@/lib/validation";

export const storyArcService = {
  async getAll(bookId: string) {
    return prisma.storyArc.findMany({
      where: { bookId },
      include: {
        parentArc: true,
        subPlots: true,
        plotEvents: { orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.storyArc.findUnique({
      where: { id },
      include: {
        parentArc: true,
        subPlots: true,
        plotEvents: {
          include: {
            location: true,
            characters: { include: { character: true } },
            items: { include: { item: true } },
          },
          orderBy: { order: "asc" },
        },
      },
    });
  },

  async create(data: StoryArcInput, bookId: string) {
    return prisma.storyArc.create({ data: { ...data, bookId } });
  },

  async update(id: string, data: Partial<StoryArcInput>) {
    return prisma.storyArc.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.storyArc.delete({ where: { id } });
  },
};
