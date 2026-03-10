import { prisma } from "@/lib/db";
import { FactionInput } from "@/lib/validation";

export const factionService = {
  async getAll() {
    return prisma.faction.findMany({
      include: {
        characters: true,
        motivations: { include: { motivation: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.faction.findUnique({
      where: { id },
      include: {
        characters: true,
        motivations: { include: { motivation: true } },
      },
    });
  },

  async create(data: FactionInput) {
    return prisma.faction.create({ data });
  },

  async update(id: string, data: Partial<FactionInput>) {
    return prisma.faction.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.faction.delete({ where: { id } });
  },

  async addMotivation(factionId: string, motivationId: string, priority: number = 1, notes?: string) {
    return prisma.factionMotivation.create({
      data: { factionId, motivationId, priority, notes },
    });
  },

  async removeMotivation(factionId: string, motivationId: string) {
    return prisma.factionMotivation.delete({
      where: { factionId_motivationId: { factionId, motivationId } },
    });
  },
};
