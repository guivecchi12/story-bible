import { prisma } from "@/lib/db";
import { ItemInput } from "@/lib/validation";

export const itemService = {
  async getAll() {
    return prisma.item.findMany({
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

  async create(data: ItemInput) {
    return prisma.item.create({ data });
  },

  async update(id: string, data: Partial<ItemInput>) {
    return prisma.item.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.item.delete({ where: { id } });
  },
};
