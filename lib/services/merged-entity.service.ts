import { prisma } from "@/lib/db";

/**
 * Merges base entity data with timeline overrides.
 * Returns the entity with timeline values overlaid, plus an _overrides map
 * indicating which fields differ from base.
 */

function overlayField(base: any, override: any, fieldName: string, overrides: Record<string, boolean>) {
  if (override !== null && override !== undefined) {
    overrides[fieldName] = true;
    return override;
  }
  return base;
}

export const mergedEntityService = {
  async getCharacter(characterId: string, timelineId: string) {
    const [base, state, timelineFactions] = await Promise.all([
      prisma.character.findUnique({
        where: { id: characterId },
        include: {
          factions: { include: { faction: true } },
          powers: { include: { power: true } },
          motivations: { include: { motivation: true } },
          locations: { include: { location: true } },
          items: { include: { item: true } },
          plotEvents: { include: { plotEvent: true } },
        },
      }),
      prisma.timelineCharacterState.findUnique({
        where: { timelineId_characterId: { timelineId, characterId } },
      }),
      prisma.timelineCharacterFaction.findMany({
        where: { timelineId, characterId },
        include: { faction: true },
      }),
    ]);

    if (!base) return null;

    const _overrides: Record<string, boolean> = {};
    const merged: any = { ...base };

    if (state) {
      merged.name = overlayField(base.name, state.name, "name", _overrides);
      merged.type = overlayField(base.type, state.type, "type", _overrides);
      merged.description = overlayField(base.description, state.description, "description", _overrides);
      merged.backstory = overlayField(base.backstory, state.backstory, "backstory", _overrides);
      merged.status = state.status || null;
      merged.customStatus = state.customStatus || null;
      merged.notes = state.notes || null;
      if (state.status) _overrides.status = true;
      if (state.notes) _overrides.notes = true;

      if (state.nicknamesOverridden) {
        merged.nicknames = state.nicknames;
        _overrides.nicknames = true;
      }

      if (state.factionsOverridden) {
        merged.factions = timelineFactions.map((tf) => ({
          factionId: tf.factionId,
          role: tf.role,
          faction: tf.faction,
        }));
        _overrides.factions = true;
      }
    }

    // Overlay timeline-specific powers, motivations, locations, items if they exist
    const [tlPowers, tlMotivations, tlLocations, tlItems] = await Promise.all([
      prisma.timelineCharacterPower.findMany({
        where: { timelineId, characterId },
        include: { power: true },
      }),
      prisma.timelineCharacterMotivation.findMany({
        where: { timelineId, characterId },
        include: { motivation: true },
      }),
      prisma.timelineCharacterLocation.findMany({
        where: { timelineId, characterId },
        include: { location: true },
      }),
      prisma.timelineCharacterItem.findMany({
        where: { timelineId, characterId },
        include: { item: true },
      }),
    ]);

    if (tlPowers.length > 0) {
      merged.powers = tlPowers.map((tp) => ({
        powerId: tp.powerId,
        strengthLevel: tp.strengthLevel,
        isPrimary: tp.isPrimary,
        notes: tp.notes,
        power: tp.power,
      }));
      _overrides.powers = true;
    }
    if (tlMotivations.length > 0) {
      merged.motivations = tlMotivations.map((tm) => ({
        motivationId: tm.motivationId,
        priority: tm.priority,
        personalNotes: tm.personalNotes,
        motivation: tm.motivation,
      }));
      _overrides.motivations = true;
    }
    if (tlLocations.length > 0) {
      merged.locations = tlLocations.map((tl) => ({
        locationId: tl.locationId,
        role: tl.role,
        location: tl.location,
      }));
      _overrides.locations = true;
    }
    if (tlItems.length > 0) {
      merged.items = tlItems.map((ti) => ({
        itemId: ti.itemId,
        status: ti.status,
        acquiredAt: ti.acquiredAt,
        item: ti.item,
      }));
      _overrides.items = true;
    }

    merged._overrides = _overrides;
    return merged;
  },

  async getItem(itemId: string, timelineId: string) {
    const [base, state] = await Promise.all([
      prisma.item.findUnique({
        where: { id: itemId },
        include: {
          location: true,
          characters: { include: { character: true } },
          plotEvents: { include: { plotEvent: true } },
        },
      }),
      prisma.timelineItemState.findUnique({
        where: { timelineId_itemId: { timelineId, itemId } },
        include: { holder: true, location: true },
      }),
    ]);

    if (!base) return null;

    const _overrides: Record<string, boolean> = {};
    const merged: any = { ...base };

    if (state) {
      merged.name = overlayField(base.name, state.name, "name", _overrides);
      merged.type = overlayField(base.type, state.type, "type", _overrides);
      merged.description = overlayField(base.description, state.description, "description", _overrides);
      merged.lore = overlayField(base.lore, state.lore, "lore", _overrides);
      merged.properties = overlayField(base.properties, state.properties, "properties", _overrides);
      merged.status = state.status || null;
      merged.customStatus = state.customStatus || null;
      merged.notes = state.notes || null;
      if (state.status) _overrides.status = true;
      if (state.notes) _overrides.notes = true;

      if (state.aliasesOverridden) {
        merged.aliases = state.aliases;
        _overrides.aliases = true;
      }

      if (state.holderId) {
        merged.holder = state.holder;
        _overrides.holder = true;
      }
      if (state.locationId) {
        merged.location = state.location;
        _overrides.location = true;
      }
    }

    merged._overrides = _overrides;
    return merged;
  },

  async getFaction(factionId: string, timelineId: string) {
    const [base, state] = await Promise.all([
      prisma.faction.findUnique({
        where: { id: factionId },
        include: {
          characters: { include: { character: true } },
          motivations: { include: { motivation: true } },
          ruledLocations: true,
        },
      }),
      prisma.timelineFactionState.findUnique({
        where: { timelineId_factionId: { timelineId, factionId } },
      }),
    ]);

    if (!base) return null;

    const _overrides: Record<string, boolean> = {};
    const merged: any = { ...base };

    if (state) {
      merged.name = overlayField(base.name, state.name, "name", _overrides);
      merged.description = overlayField(base.description, state.description, "description", _overrides);
      merged.status = state.status || null;
      merged.customStatus = state.customStatus || null;
      merged.notes = state.notes || null;
      if (state.status) _overrides.status = true;
      if (state.notes) _overrides.notes = true;
    }

    // Overlay timeline faction motivations
    const tlMotivations = await prisma.timelineFactionMotivation.findMany({
      where: { timelineId, factionId },
      include: { motivation: true },
    });
    if (tlMotivations.length > 0) {
      merged.motivations = tlMotivations.map((tm) => ({
        motivationId: tm.motivationId,
        priority: tm.priority,
        notes: tm.notes,
        motivation: tm.motivation,
      }));
      _overrides.motivations = true;
    }

    // Build timeline-aware member list:
    // 1. Characters who have this faction via TimelineCharacterFaction
    // 2. Characters who have this faction in base AND haven't overridden their factions
    const [tlCharacters, overriddenCharStates] = await Promise.all([
      prisma.timelineCharacterFaction.findMany({
        where: { timelineId, factionId },
        include: { character: true },
      }),
      prisma.timelineCharacterState.findMany({
        where: { timelineId, factionsOverridden: true },
        select: { characterId: true },
      }),
    ]);

    const overriddenCharIds = new Set(overriddenCharStates.map((s) => s.characterId));

    // Keep base members whose factions are NOT overridden in this timeline
    const baseMembers = (base.characters || []).filter(
      (cf: any) => !overriddenCharIds.has(cf.characterId),
    );

    // Timeline members for this faction
    const tlMembers = tlCharacters.map((tc) => ({
      characterId: tc.characterId,
      role: tc.role,
      character: tc.character,
    }));

    // Merge: base (non-overridden) + timeline
    const allMembers = [...baseMembers, ...tlMembers];
    // Deduplicate by characterId (timeline takes precedence)
    const seen = new Set<string>();
    const dedupedMembers = [];
    for (const m of [...tlMembers, ...baseMembers]) {
      if (!seen.has(m.characterId)) {
        seen.add(m.characterId);
        dedupedMembers.push(m);
      }
    }
    merged.characters = dedupedMembers;
    if (tlMembers.length > 0 || overriddenCharIds.size > 0) {
      _overrides.characters = true;
    }

    // Build timeline-aware territories list
    // Base locations ruled by this faction
    const baseRuled = base.ruledLocations || [];
    // Timeline locations that override their ruler to this faction
    const tlRuledLocations = await prisma.timelineLocationState.findMany({
      where: { timelineId, rulerFactionId: factionId },
      include: { location: true },
    });
    // Timeline locations that override their ruler AWAY from this faction
    const tlOverriddenLocations = await prisma.timelineLocationState.findMany({
      where: { timelineId, location: { rulerFactionId: factionId } },
      select: { locationId: true, rulerFactionId: true },
    });
    const overriddenLocationIds = new Set(tlOverriddenLocations.map((l) => l.locationId));

    const baseTerritory = baseRuled
      .filter((l: any) => !overriddenLocationIds.has(l.id))
      .map((l: any) => ({ id: l.id, name: l.name, type: l.type }));
    const tlTerritory = tlRuledLocations.map((tl) => ({
      id: tl.location.id,
      name: tl.name || tl.location.name,
      type: tl.type || tl.location.type,
    }));

    // Deduplicate
    const seenLocs = new Set<string>();
    const territories = [];
    for (const t of [...tlTerritory, ...baseTerritory]) {
      if (!seenLocs.has(t.id)) {
        seenLocs.add(t.id);
        territories.push(t);
      }
    }
    merged.ruledLocations = territories;
    if (tlRuledLocations.length > 0 || overriddenLocationIds.size > 0) {
      _overrides.ruledLocations = true;
    }

    merged._overrides = _overrides;
    return merged;
  },

  async getLocation(locationId: string, timelineId: string) {
    const [base, state] = await Promise.all([
      prisma.location.findUnique({
        where: { id: locationId },
        include: {
          parent: true,
          children: true,
          rulerFaction: true,
          characters: { include: { character: true } },
          items: true,
          plotEvents: true,
          timelines: true,
        },
      }),
      prisma.timelineLocationState.findUnique({
        where: { timelineId_locationId: { timelineId, locationId } },
        include: { rulerFaction: true },
      }),
    ]);

    if (!base) return null;

    const _overrides: Record<string, boolean> = {};
    const merged: any = { ...base };

    if (state) {
      merged.name = overlayField(base.name, state.name, "name", _overrides);
      merged.type = overlayField(base.type, state.type, "type", _overrides);
      merged.description = overlayField(base.description, state.description, "description", _overrides);
      merged.climate = overlayField(base.climate, state.climate, "climate", _overrides);
      merged.culture = overlayField(base.culture, state.culture, "culture", _overrides);
      merged.status = state.status || null;
      merged.customStatus = state.customStatus || null;
      merged.notes = state.notes || null;
      if (state.status) _overrides.status = true;
      if (state.notes) _overrides.notes = true;

      if (state.rulerFactionId) {
        merged.rulerFaction = state.rulerFaction;
        _overrides.rulerFaction = true;
      }
    }

    merged._overrides = _overrides;
    return merged;
  },
};
