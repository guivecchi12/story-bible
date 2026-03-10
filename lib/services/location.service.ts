import { prisma } from "@/lib/db";
import { LocationInput } from "@/lib/validation";

export const locationService = {
  async getAll() {
    return prisma.location.findMany({
      include: {
        parent: true,
        children: true,
        characters: { include: { character: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.location.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        characters: { include: { character: true } },
        plotEvents: true,
        timelineEvents: true,
        items: true,
      },
    });
  },

  async create(data: LocationInput) {
    return prisma.location.create({ data });
  },

  async update(id: string, data: Partial<LocationInput>) {
    return prisma.location.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.location.delete({ where: { id } });
  },
};
