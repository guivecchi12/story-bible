import { prisma } from "@/lib/db";
import { PowerInput } from "@/lib/validation";

export const powerService = {
  async getAll(bookId: string) {
    return prisma.power.findMany({
      where: { bookId },
      include: { characters: { include: { character: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.power.findUnique({
      where: { id },
      include: { characters: { include: { character: true } } },
    });
  },

  async create(data: PowerInput, bookId: string) {
    return prisma.power.create({ data: { ...data, bookId } });
  },

  async update(id: string, data: Partial<PowerInput>) {
    return prisma.power.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.power.delete({ where: { id } });
  },
};
