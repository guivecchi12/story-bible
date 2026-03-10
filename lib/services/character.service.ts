import { prisma } from "@/lib/db";
import { CharacterInput } from "@/lib/validation";

export const characterService = {
  async getAll() {
    return prisma.character.findMany({
      include: {
        faction: true,
        powers: { include: { power: true } },
        motivations: { include: { motivation: true } },
        locations: { include: { location: true } },
        items: { include: { item: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: {
        faction: true,
        powers: { include: { power: true } },
        motivations: { include: { motivation: true } },
        locations: { include: { location: true } },
        items: { include: { item: true } },
        plotEvents: { include: { plotEvent: true } },
        timelineEvents: { include: { timelineEvent: true } },
      },
    });
  },

  async create(data: CharacterInput) {
    return prisma.character.create({
      data,
      include: { faction: true },
    });
  },

  async update(id: string, data: Partial<CharacterInput>) {
    return prisma.character.update({
      where: { id },
      data,
      include: { faction: true },
    });
  },

  async delete(id: string) {
    return prisma.character.delete({ where: { id } });
  },

  async addPower(characterId: string, powerId: string, strengthLevel: number = 5, isPrimary: boolean = false, notes?: string) {
    return prisma.characterPower.create({
      data: { characterId, powerId, strengthLevel, isPrimary, notes },
    });
  },

  async removePower(characterId: string, powerId: string) {
    return prisma.characterPower.delete({
      where: { characterId_powerId: { characterId, powerId } },
    });
  },

  async addMotivation(characterId: string, motivationId: string, priority: number = 1, personalNotes?: string) {
    return prisma.characterMotivation.create({
      data: { characterId, motivationId, priority, personalNotes },
    });
  },

  async removeMotivation(characterId: string, motivationId: string) {
    return prisma.characterMotivation.delete({
      where: { characterId_motivationId: { characterId, motivationId } },
    });
  },

  async addLocation(characterId: string, locationId: string, role: string) {
    return prisma.characterLocation.create({
      data: { characterId, locationId, role },
    });
  },

  async removeLocation(characterId: string, locationId: string) {
    return prisma.characterLocation.delete({
      where: { characterId_locationId: { characterId, locationId } },
    });
  },

  async addItem(characterId: string, itemId: string, status: string, acquiredAt?: string) {
    return prisma.characterItem.create({
      data: { characterId, itemId, status, acquiredAt },
    });
  },

  async removeItem(characterId: string, itemId: string) {
    return prisma.characterItem.delete({
      where: { characterId_itemId: { characterId, itemId } },
    });
  },
};
