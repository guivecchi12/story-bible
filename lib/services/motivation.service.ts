import { prisma } from "@/lib/db";
import { MotivationInput } from "@/lib/validation";

export const motivationService = {
  async getAll(bookId: string) {
    return prisma.motivation.findMany({
      where: { bookId },
      include: {
        characters: { include: { character: true } },
        factions: { include: { faction: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.motivation.findUnique({
      where: { id },
      include: {
        characters: { include: { character: true } },
        factions: { include: { faction: true } },
      },
    });
  },

  async create(data: MotivationInput, bookId: string) {
    return prisma.motivation.create({ data: { ...data, bookId } });
  },

  async update(id: string, data: Partial<MotivationInput>) {
    return prisma.motivation.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.motivation.delete({ where: { id } });
  },
};
