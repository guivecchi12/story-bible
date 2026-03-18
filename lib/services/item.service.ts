import { prisma } from "@/lib/db";
import { ItemInput } from "@/lib/validation";

export const itemService = {
  async getAll(bookId: string) {
    return prisma.item.findMany({
      where: { bookId },
      include: {
        location: true,
        characters: { include: { character: true } },
        plotEvents: { include: { plotEvent: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.item.findUnique({
      where: { id },
      include: {
        location: true,
        characters: { include: { character: true } },
        plotEvents: { include: { plotEvent: true } },
      },
    });
  },

  async create(data: ItemInput, bookId: string) {
    return prisma.item.create({ data: { ...data, bookId } });
  },

  async update(id: string, data: Partial<ItemInput>) {
    return prisma.item.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.item.delete({ where: { id } });
  },
};
