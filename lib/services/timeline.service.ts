import { prisma } from "@/lib/db";
import { TimelineInput } from "@/lib/validation";

const fullInclude = {
  location: true,
  plotEvent: { include: { storyArc: true } },
  characterStates: { include: { character: true } },
  characterFactions: { include: { character: true, faction: true } },
  itemStates: { include: { item: true, holder: true, location: true } },
  factionStates: { include: { faction: true } },
  locationStates: { include: { location: true, rulerFaction: true } },
  characterMotivations: { include: { character: true, motivation: true } },
  factionMotivations: { include: { faction: true, motivation: true } },
  characterPowers: { include: { character: true, power: true } },
  characterLocations: { include: { character: true, location: true } },
  characterItems: { include: { character: true, item: true } },
};

export const timelineService = {
  async getAll(bookId: string) {
    return prisma.timeline.findMany({
      where: { plotEvent: { bookId } },
      include: {
        location: true,
        plotEvent: { include: { storyArc: true } },
        characterStates: { include: { character: true } },
      },
      orderBy: { order: "asc" },
    });
  },

  async getByPlotEvent(plotEventId: string) {
    return prisma.timeline.findMany({
      where: { plotEventId },
      include: {
        location: true,
        characterStates: { include: { character: true } },
      },
      orderBy: { order: "asc" },
    });
  },

  async getById(id: string) {
    return prisma.timeline.findUnique({
      where: { id },
      include: fullInclude,
    });
  },

  async create(data: TimelineInput, inheritFromId?: string) {
    const timeline = await prisma.timeline.create({
      data: {
        title: data.title,
        description: data.description,
        inWorldDate: data.inWorldDate,
        era: data.era,
        order: data.order,
        plotEventId: data.plotEventId,
        locationId: data.locationId || null,
      },
    });

    // Inherit state from a previous timeline
    if (inheritFromId) {
      await this.inheritState(timeline.id, inheritFromId);
    }

    return this.getById(timeline.id);
  },

  async update(id: string, data: Partial<TimelineInput>) {
    return prisma.timeline.update({
      where: { id },
      data,
      include: fullInclude,
    });
  },

  async delete(id: string) {
    return prisma.timeline.delete({ where: { id } });
  },

  // Copy all state from source timeline to target timeline
  async inheritState(targetId: string, sourceId: string) {
    const source = await prisma.timeline.findUnique({
      where: { id: sourceId },
      include: fullInclude,
    });
    if (!source) return;

    await prisma.$transaction(async (tx) => {
      // Copy character states
      if (source.characterStates.length > 0) {
        await tx.timelineCharacterState.createMany({
          data: source.characterStates.map((s) => ({
            timelineId: targetId,
            characterId: s.characterId,
            name: s.name,
            nicknames: s.nicknames,
            nicknamesOverridden: s.nicknamesOverridden,
            type: s.type,
            description: s.description,
            backstory: s.backstory,
            status: s.status,
            customStatus: s.customStatus,
            notes: s.notes,
            factionsOverridden: s.factionsOverridden,
          })),
        });
      }

      // Copy character faction overrides
      const sourceCharFactions = await tx.timelineCharacterFaction.findMany({
        where: { timelineId: sourceId },
      });
      if (sourceCharFactions.length > 0) {
        await tx.timelineCharacterFaction.createMany({
          data: sourceCharFactions.map((s) => ({
            timelineId: targetId,
            characterId: s.characterId,
            factionId: s.factionId,
            role: s.role,
          })),
        });
      }

      // Copy item states
      if (source.itemStates.length > 0) {
        await tx.timelineItemState.createMany({
          data: source.itemStates.map((s) => ({
            timelineId: targetId,
            itemId: s.itemId,
            name: s.name,
            aliases: s.aliases,
            aliasesOverridden: s.aliasesOverridden,
            type: s.type,
            description: s.description,
            lore: s.lore,
            properties: s.properties,
            status: s.status,
            customStatus: s.customStatus,
            holderId: s.holderId,
            locationId: s.locationId,
            notes: s.notes,
          })),
        });
      }

      // Copy faction states
      if (source.factionStates.length > 0) {
        await tx.timelineFactionState.createMany({
          data: source.factionStates.map((s) => ({
            timelineId: targetId,
            factionId: s.factionId,
            name: s.name,
            status: s.status,
            customStatus: s.customStatus,
            description: s.description,
            notes: s.notes,
          })),
        });
      }

      // Copy location states
      if (source.locationStates.length > 0) {
        await tx.timelineLocationState.createMany({
          data: source.locationStates.map((s) => ({
            timelineId: targetId,
            locationId: s.locationId,
            name: s.name,
            type: s.type,
            climate: s.climate,
            culture: s.culture,
            status: s.status,
            customStatus: s.customStatus,
            description: s.description,
            notes: s.notes,
            rulerFactionId: s.rulerFactionId,
          })),
        });
      }

      // Copy character motivations
      if (source.characterMotivations.length > 0) {
        await tx.timelineCharacterMotivation.createMany({
          data: source.characterMotivations.map((s) => ({
            timelineId: targetId,
            characterId: s.characterId,
            motivationId: s.motivationId,
            priority: s.priority,
            personalNotes: s.personalNotes,
          })),
        });
      }

      // Copy faction motivations
      if (source.factionMotivations.length > 0) {
        await tx.timelineFactionMotivation.createMany({
          data: source.factionMotivations.map((s) => ({
            timelineId: targetId,
            factionId: s.factionId,
            motivationId: s.motivationId,
            priority: s.priority,
            notes: s.notes,
          })),
        });
      }

      // Copy character powers
      if (source.characterPowers.length > 0) {
        await tx.timelineCharacterPower.createMany({
          data: source.characterPowers.map((s) => ({
            timelineId: targetId,
            characterId: s.characterId,
            powerId: s.powerId,
            strengthLevel: s.strengthLevel,
            isPrimary: s.isPrimary,
            notes: s.notes,
          })),
        });
      }

      // Copy character locations
      if (source.characterLocations.length > 0) {
        await tx.timelineCharacterLocation.createMany({
          data: source.characterLocations.map((s) => ({
            timelineId: targetId,
            characterId: s.characterId,
            locationId: s.locationId,
            role: s.role,
          })),
        });
      }

      // Copy character items
      if (source.characterItems.length > 0) {
        await tx.timelineCharacterItem.createMany({
          data: source.characterItems.map((s) => ({
            timelineId: targetId,
            characterId: s.characterId,
            itemId: s.itemId,
            status: s.status,
            acquiredAt: s.acquiredAt,
          })),
        });
      }
    });
  },

  // Find the most recent timeline before this one (by order, within the same book)
  async findPreviousTimeline(plotEventId: string, order: number, bookId: string) {
    // First try within the same plot event
    const sameEvent = await prisma.timeline.findFirst({
      where: { plotEventId, order: { lt: order } },
      orderBy: { order: "desc" },
    });
    if (sameEvent) return sameEvent;

    // Then try from previous plot events (by order) in the same book
    const currentPlotEvent = await prisma.plotEvent.findUnique({
      where: { id: plotEventId },
    });
    if (!currentPlotEvent) return null;

    const previousTimeline = await prisma.timeline.findFirst({
      where: {
        plotEvent: {
          bookId,
          OR: [
            { order: { lt: currentPlotEvent.order } },
            {
              order: currentPlotEvent.order,
              id: { not: plotEventId },
            },
          ],
        },
      },
      orderBy: [
        { plotEvent: { order: "desc" } },
        { order: "desc" },
      ],
    });
    return previousTimeline;
  },

  // State mutation methods
  async setCharacterState(timelineId: string, data: {
    characterId: string; name?: string | null; nicknames?: string[];
    nicknamesOverridden?: boolean; type?: string | null;
    description?: string | null; backstory?: string | null;
    status?: string | null; customStatus?: string | null;
    notes?: string | null; factionsOverridden?: boolean;
  }) {
    const { characterId, ...fields } = data;
    return prisma.timelineCharacterState.upsert({
      where: { timelineId_characterId: { timelineId, characterId } },
      update: fields,
      create: { timelineId, characterId, ...fields },
    });
  },

  async removeCharacterState(timelineId: string, characterId: string) {
    return prisma.timelineCharacterState.delete({
      where: { timelineId_characterId: { timelineId, characterId } },
    });
  },

  async setItemState(timelineId: string, data: {
    itemId: string; name?: string | null; aliases?: string[];
    aliasesOverridden?: boolean; type?: string | null;
    description?: string | null; lore?: string | null;
    properties?: string | null; status?: string | null;
    customStatus?: string | null; holderId?: string | null;
    locationId?: string | null; notes?: string | null;
  }) {
    const { itemId, ...fields } = data;
    return prisma.timelineItemState.upsert({
      where: { timelineId_itemId: { timelineId, itemId } },
      update: fields,
      create: { timelineId, itemId, ...fields },
    });
  },

  async removeItemState(timelineId: string, itemId: string) {
    return prisma.timelineItemState.delete({
      where: { timelineId_itemId: { timelineId, itemId } },
    });
  },

  async setFactionState(timelineId: string, data: {
    factionId: string; name?: string | null; status?: string | null;
    customStatus?: string | null; description?: string | null;
    notes?: string | null;
  }) {
    const { factionId, ...fields } = data;
    return prisma.timelineFactionState.upsert({
      where: { timelineId_factionId: { timelineId, factionId } },
      update: fields,
      create: { timelineId, factionId, ...fields },
    });
  },

  async removeFactionState(timelineId: string, factionId: string) {
    return prisma.timelineFactionState.delete({
      where: { timelineId_factionId: { timelineId, factionId } },
    });
  },

  async setLocationState(timelineId: string, data: {
    locationId: string; name?: string | null; type?: string | null;
    climate?: string | null; culture?: string | null;
    status?: string | null; customStatus?: string | null;
    description?: string | null; notes?: string | null;
    rulerFactionId?: string | null;
  }) {
    const { locationId, ...fields } = data;
    return prisma.timelineLocationState.upsert({
      where: { timelineId_locationId: { timelineId, locationId } },
      update: fields,
      create: { timelineId, locationId, ...fields },
    });
  },

  async removeLocationState(timelineId: string, locationId: string) {
    return prisma.timelineLocationState.delete({
      where: { timelineId_locationId: { timelineId, locationId } },
    });
  },

  async setCharacterMotivation(timelineId: string, data: {
    characterId: string; motivationId: string; priority?: number; personalNotes?: string | null;
  }) {
    return prisma.timelineCharacterMotivation.upsert({
      where: { timelineId_characterId_motivationId: { timelineId, characterId: data.characterId, motivationId: data.motivationId } },
      update: { priority: data.priority, personalNotes: data.personalNotes },
      create: { timelineId, characterId: data.characterId, motivationId: data.motivationId, priority: data.priority ?? 1, personalNotes: data.personalNotes },
    });
  },

  async removeCharacterMotivation(timelineId: string, characterId: string, motivationId: string) {
    return prisma.timelineCharacterMotivation.delete({
      where: { timelineId_characterId_motivationId: { timelineId, characterId, motivationId } },
    });
  },

  async setFactionMotivation(timelineId: string, data: {
    factionId: string; motivationId: string; priority?: number; notes?: string | null;
  }) {
    return prisma.timelineFactionMotivation.upsert({
      where: { timelineId_factionId_motivationId: { timelineId, factionId: data.factionId, motivationId: data.motivationId } },
      update: { priority: data.priority, notes: data.notes },
      create: { timelineId, factionId: data.factionId, motivationId: data.motivationId, priority: data.priority ?? 1, notes: data.notes },
    });
  },

  async removeFactionMotivation(timelineId: string, factionId: string, motivationId: string) {
    return prisma.timelineFactionMotivation.delete({
      where: { timelineId_factionId_motivationId: { timelineId, factionId, motivationId } },
    });
  },

  async setCharacterPower(timelineId: string, data: {
    characterId: string; powerId: string; strengthLevel?: number; isPrimary?: boolean; notes?: string | null;
  }) {
    return prisma.timelineCharacterPower.upsert({
      where: { timelineId_characterId_powerId: { timelineId, characterId: data.characterId, powerId: data.powerId } },
      update: { strengthLevel: data.strengthLevel, isPrimary: data.isPrimary, notes: data.notes },
      create: { timelineId, characterId: data.characterId, powerId: data.powerId, strengthLevel: data.strengthLevel ?? 5, isPrimary: data.isPrimary ?? false, notes: data.notes },
    });
  },

  async removeCharacterPower(timelineId: string, characterId: string, powerId: string) {
    return prisma.timelineCharacterPower.delete({
      where: { timelineId_characterId_powerId: { timelineId, characterId, powerId } },
    });
  },

  async setCharacterLocation(timelineId: string, data: {
    characterId: string; locationId: string; role: string;
  }) {
    return prisma.timelineCharacterLocation.upsert({
      where: { timelineId_characterId_locationId: { timelineId, characterId: data.characterId, locationId: data.locationId } },
      update: { role: data.role },
      create: { timelineId, ...data },
    });
  },

  async removeCharacterLocation(timelineId: string, characterId: string, locationId: string) {
    return prisma.timelineCharacterLocation.delete({
      where: { timelineId_characterId_locationId: { timelineId, characterId, locationId } },
    });
  },

  async setCharacterItem(timelineId: string, data: {
    characterId: string; itemId: string; status: string; acquiredAt?: string | null;
  }) {
    return prisma.timelineCharacterItem.upsert({
      where: { timelineId_characterId_itemId: { timelineId, characterId: data.characterId, itemId: data.itemId } },
      update: { status: data.status, acquiredAt: data.acquiredAt },
      create: { timelineId, ...data },
    });
  },

  async removeCharacterItem(timelineId: string, characterId: string, itemId: string) {
    return prisma.timelineCharacterItem.delete({
      where: { timelineId_characterId_itemId: { timelineId, characterId, itemId } },
    });
  },
};
