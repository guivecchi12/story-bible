import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma-mock";

// Import services after mock is set up
import { characterService } from "@/lib/services/character.service";
import { powerService } from "@/lib/services/power.service";
import { motivationService } from "@/lib/services/motivation.service";
import { factionService } from "@/lib/services/faction.service";
import { locationService } from "@/lib/services/location.service";
import { storyArcService } from "@/lib/services/story-arc.service";
import { plotEventService } from "@/lib/services/plot-event.service";
import { timelineService } from "@/lib/services/timeline.service";
import { itemService } from "@/lib/services/item.service";
import { searchService } from "@/lib/services/search.service";

const BOOK_ID = "book-1";

describe("characterService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll scopes query by bookId", async () => {
    await characterService.getAll(BOOK_ID);

    expect(prismaMock.character.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bookId: BOOK_ID } }),
    );
  });

  it("getAll includes relations and orders by createdAt desc", async () => {
    await characterService.getAll(BOOK_ID);

    expect(prismaMock.character.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          faction: true,
          powers: expect.any(Object),
          motivations: expect.any(Object),
          locations: expect.any(Object),
          items: expect.any(Object),
        }),
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("create merges bookId into data", async () => {
    const data = { name: "Test Character", type: "PROTAGONIST" };

    await characterService.create(data as any, BOOK_ID);

    expect(prismaMock.character.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookId: BOOK_ID, name: "Test Character" }),
      }),
    );
  });

  it("getById queries by id", async () => {
    await characterService.getById("char-1");

    expect(prismaMock.character.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "char-1" } }),
    );
  });

  it("update passes data and id", async () => {
    await characterService.update("char-1", { name: "Updated" } as any);

    expect(prismaMock.character.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "char-1" },
        data: { name: "Updated" },
      }),
    );
  });

  it("delete passes id", async () => {
    await characterService.delete("char-1");

    expect(prismaMock.character.delete).toHaveBeenCalledWith({ where: { id: "char-1" } });
  });

  it("addPower creates a characterPower record", async () => {
    await characterService.addPower("char-1", "pow-1", 7, true, "Strong");

    expect(prismaMock.characterPower.create).toHaveBeenCalledWith({
      data: { characterId: "char-1", powerId: "pow-1", strengthLevel: 7, isPrimary: true, notes: "Strong" },
    });
  });

  it("removePower deletes by composite key", async () => {
    await characterService.removePower("char-1", "pow-1");

    expect(prismaMock.characterPower.delete).toHaveBeenCalledWith({
      where: { characterId_powerId: { characterId: "char-1", powerId: "pow-1" } },
    });
  });

  it("addMotivation creates a characterMotivation record", async () => {
    await characterService.addMotivation("char-1", "mot-1", 3, "Personal");

    expect(prismaMock.characterMotivation.create).toHaveBeenCalledWith({
      data: { characterId: "char-1", motivationId: "mot-1", priority: 3, personalNotes: "Personal" },
    });
  });

  it("removeMotivation deletes by composite key", async () => {
    await characterService.removeMotivation("char-1", "mot-1");

    expect(prismaMock.characterMotivation.delete).toHaveBeenCalledWith({
      where: { characterId_motivationId: { characterId: "char-1", motivationId: "mot-1" } },
    });
  });

  it("addLocation creates a characterLocation record", async () => {
    await characterService.addLocation("char-1", "loc-1", "Resident");

    expect(prismaMock.characterLocation.create).toHaveBeenCalledWith({
      data: { characterId: "char-1", locationId: "loc-1", role: "Resident" },
    });
  });

  it("removeLocation deletes by composite key", async () => {
    await characterService.removeLocation("char-1", "loc-1");

    expect(prismaMock.characterLocation.delete).toHaveBeenCalledWith({
      where: { characterId_locationId: { characterId: "char-1", locationId: "loc-1" } },
    });
  });

  it("addItem creates a characterItem record", async () => {
    await characterService.addItem("char-1", "item-1", "owned", "Chapter 3");

    expect(prismaMock.characterItem.create).toHaveBeenCalledWith({
      data: { characterId: "char-1", itemId: "item-1", status: "owned", acquiredAt: "Chapter 3" },
    });
  });

  it("removeItem deletes by composite key", async () => {
    await characterService.removeItem("char-1", "item-1");

    expect(prismaMock.characterItem.delete).toHaveBeenCalledWith({
      where: { characterId_itemId: { characterId: "char-1", itemId: "item-1" } },
    });
  });
});

describe("powerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll scopes query by bookId", async () => {
    await powerService.getAll(BOOK_ID);

    expect(prismaMock.power.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bookId: BOOK_ID } }),
    );
  });

  it("getAll includes character relations and orders by createdAt desc", async () => {
    await powerService.getAll(BOOK_ID);

    expect(prismaMock.power.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { characters: { include: { character: true } } },
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("create merges bookId into data", async () => {
    const data = { name: "Telekinesis" };

    await powerService.create(data as any, BOOK_ID);

    expect(prismaMock.power.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookId: BOOK_ID, name: "Telekinesis" }),
      }),
    );
  });

  it("getById queries by id", async () => {
    await powerService.getById("power-1");

    expect(prismaMock.power.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "power-1" } }),
    );
  });

  it("update passes data and id", async () => {
    await powerService.update("power-1", { name: "Updated" } as any);

    expect(prismaMock.power.update).toHaveBeenCalledWith({ where: { id: "power-1" }, data: { name: "Updated" } });
  });

  it("delete passes id", async () => {
    await powerService.delete("power-1");

    expect(prismaMock.power.delete).toHaveBeenCalledWith({ where: { id: "power-1" } });
  });
});

describe("motivationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll scopes query by bookId", async () => {
    await motivationService.getAll(BOOK_ID);

    expect(prismaMock.motivation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bookId: BOOK_ID } }),
    );
  });

  it("getAll includes character and faction relations", async () => {
    await motivationService.getAll(BOOK_ID);

    expect(prismaMock.motivation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          characters: { include: { character: true } },
          factions: { include: { faction: true } },
        }),
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("create merges bookId into data", async () => {
    const data = { name: "Revenge", category: "PERSONAL" };

    await motivationService.create(data as any, BOOK_ID);

    expect(prismaMock.motivation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookId: BOOK_ID, name: "Revenge" }),
      }),
    );
  });

  it("getById queries by id", async () => {
    await motivationService.getById("mot-1");

    expect(prismaMock.motivation.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "mot-1" } }),
    );
  });

  it("update passes data and id", async () => {
    await motivationService.update("mot-1", { name: "Justice" } as any);

    expect(prismaMock.motivation.update).toHaveBeenCalledWith({ where: { id: "mot-1" }, data: { name: "Justice" } });
  });

  it("delete passes id", async () => {
    await motivationService.delete("mot-1");

    expect(prismaMock.motivation.delete).toHaveBeenCalledWith({ where: { id: "mot-1" } });
  });
});

describe("factionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll scopes query by bookId", async () => {
    await factionService.getAll(BOOK_ID);

    expect(prismaMock.faction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bookId: BOOK_ID } }),
    );
  });

  it("getAll includes characters and motivation relations", async () => {
    await factionService.getAll(BOOK_ID);

    expect(prismaMock.faction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          characters: true,
          motivations: { include: { motivation: true } },
        }),
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("create merges bookId into data", async () => {
    const data = { name: "The Order" };

    await factionService.create(data as any, BOOK_ID);

    expect(prismaMock.faction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookId: BOOK_ID, name: "The Order" }),
      }),
    );
  });

  it("getById queries by id", async () => {
    await factionService.getById("faction-1");

    expect(prismaMock.faction.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "faction-1" } }),
    );
  });

  it("update passes data and id", async () => {
    await factionService.update("faction-1", { name: "Updated" } as any);

    expect(prismaMock.faction.update).toHaveBeenCalledWith({ where: { id: "faction-1" }, data: { name: "Updated" } });
  });

  it("delete passes id", async () => {
    await factionService.delete("faction-1");

    expect(prismaMock.faction.delete).toHaveBeenCalledWith({ where: { id: "faction-1" } });
  });

  it("addMotivation creates a factionMotivation record", async () => {
    await factionService.addMotivation("faction-1", "mot-1", 2, "Key goal");

    expect(prismaMock.factionMotivation.create).toHaveBeenCalledWith({
      data: { factionId: "faction-1", motivationId: "mot-1", priority: 2, notes: "Key goal" },
    });
  });

  it("removeMotivation deletes by composite key", async () => {
    await factionService.removeMotivation("faction-1", "mot-1");

    expect(prismaMock.factionMotivation.delete).toHaveBeenCalledWith({
      where: { factionId_motivationId: { factionId: "faction-1", motivationId: "mot-1" } },
    });
  });
});

describe("locationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll scopes query by bookId", async () => {
    await locationService.getAll(BOOK_ID);

    expect(prismaMock.location.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bookId: BOOK_ID } }),
    );
  });

  it("getAll includes parent, children, characters, items relations", async () => {
    await locationService.getAll(BOOK_ID);

    expect(prismaMock.location.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          parent: true,
          children: true,
          characters: { include: { character: true } },
          items: true,
        }),
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("create merges bookId into data", async () => {
    const data = { name: "Castle" };

    await locationService.create(data as any, BOOK_ID);

    expect(prismaMock.location.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookId: BOOK_ID, name: "Castle" }),
      }),
    );
  });

  it("getById queries by id", async () => {
    await locationService.getById("loc-1");

    expect(prismaMock.location.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "loc-1" } }),
    );
  });

  it("update passes data and id", async () => {
    await locationService.update("loc-1", { name: "Updated" } as any);

    expect(prismaMock.location.update).toHaveBeenCalledWith({ where: { id: "loc-1" }, data: { name: "Updated" } });
  });

  it("delete passes id", async () => {
    await locationService.delete("loc-1");

    expect(prismaMock.location.delete).toHaveBeenCalledWith({ where: { id: "loc-1" } });
  });
});

describe("storyArcService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll scopes query by bookId", async () => {
    await storyArcService.getAll(BOOK_ID);

    expect(prismaMock.storyArc.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bookId: BOOK_ID } }),
    );
  });

  it("getAll includes parentArc, subPlots, plotEvents relations", async () => {
    await storyArcService.getAll(BOOK_ID);

    expect(prismaMock.storyArc.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          parentArc: true,
          subPlots: true,
          plotEvents: { orderBy: { order: "asc" } },
        }),
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("create merges bookId into data", async () => {
    const data = { title: "Main Quest" };

    await storyArcService.create(data as any, BOOK_ID);

    expect(prismaMock.storyArc.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookId: BOOK_ID, title: "Main Quest" }),
      }),
    );
  });

  it("getById queries by id", async () => {
    await storyArcService.getById("arc-1");

    expect(prismaMock.storyArc.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "arc-1" } }),
    );
  });

  it("update passes data and id", async () => {
    await storyArcService.update("arc-1", { title: "Updated" } as any);

    expect(prismaMock.storyArc.update).toHaveBeenCalledWith({ where: { id: "arc-1" }, data: { title: "Updated" } });
  });

  it("delete passes id", async () => {
    await storyArcService.delete("arc-1");

    expect(prismaMock.storyArc.delete).toHaveBeenCalledWith({ where: { id: "arc-1" } });
  });
});

describe("plotEventService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll scopes query by bookId", async () => {
    await plotEventService.getAll(BOOK_ID);

    expect(prismaMock.plotEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bookId: BOOK_ID } }),
    );
  });

  it("getAll includes storyArc, location, timelineEvent, characters, items and orders by order asc", async () => {
    await plotEventService.getAll(BOOK_ID);

    expect(prismaMock.plotEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          storyArc: true,
          location: true,
          timelineEvent: true,
          characters: { include: { character: true } },
          items: { include: { item: true } },
        }),
        orderBy: { order: "asc" },
      }),
    );
  });

  it("create merges bookId into data", async () => {
    const data = { title: "Battle" };

    await plotEventService.create(data as any, BOOK_ID);

    expect(prismaMock.plotEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookId: BOOK_ID, title: "Battle" }),
      }),
    );
  });

  it("create includes storyArc relation", async () => {
    await plotEventService.create({ title: "Event" } as any, BOOK_ID);

    expect(prismaMock.plotEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ include: { storyArc: true } }),
    );
  });

  it("getById queries by id", async () => {
    await plotEventService.getById("pe-1");

    expect(prismaMock.plotEvent.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "pe-1" } }),
    );
  });

  it("update passes data and id", async () => {
    await plotEventService.update("pe-1", { title: "Updated" } as any);

    expect(prismaMock.plotEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pe-1" },
        data: { title: "Updated" },
      }),
    );
  });

  it("delete passes id", async () => {
    await plotEventService.delete("pe-1");

    expect(prismaMock.plotEvent.delete).toHaveBeenCalledWith({ where: { id: "pe-1" } });
  });

  it("addCharacter creates a plotEventCharacter record", async () => {
    await plotEventService.addCharacter("pe-1", "char-1", "Protagonist");

    expect(prismaMock.plotEventCharacter.create).toHaveBeenCalledWith({
      data: { plotEventId: "pe-1", characterId: "char-1", role: "Protagonist" },
    });
  });

  it("removeCharacter deletes by composite key", async () => {
    await plotEventService.removeCharacter("pe-1", "char-1");

    expect(prismaMock.plotEventCharacter.delete).toHaveBeenCalledWith({
      where: { plotEventId_characterId: { plotEventId: "pe-1", characterId: "char-1" } },
    });
  });

  it("addItem creates a plotEventItem record", async () => {
    await plotEventService.addItem("pe-1", "item-1", "Weapon");

    expect(prismaMock.plotEventItem.create).toHaveBeenCalledWith({
      data: { plotEventId: "pe-1", itemId: "item-1", role: "Weapon" },
    });
  });

  it("removeItem deletes by composite key", async () => {
    await plotEventService.removeItem("pe-1", "item-1");

    expect(prismaMock.plotEventItem.delete).toHaveBeenCalledWith({
      where: { plotEventId_itemId: { plotEventId: "pe-1", itemId: "item-1" } },
    });
  });
});

describe("timelineService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll scopes query by bookId", async () => {
    await timelineService.getAll(BOOK_ID);

    expect(prismaMock.timelineEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bookId: BOOK_ID } }),
    );
  });

  it("getAll includes location, characters, plotEvents and orders by order asc", async () => {
    await timelineService.getAll(BOOK_ID);

    expect(prismaMock.timelineEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          location: true,
          characters: { include: { character: true } },
          plotEvents: true,
        }),
        orderBy: { order: "asc" },
      }),
    );
  });

  it("create merges bookId into data", async () => {
    const data = { title: "Era begins" };

    await timelineService.create(data as any, BOOK_ID);

    expect(prismaMock.timelineEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookId: BOOK_ID, title: "Era begins" }),
      }),
    );
  });

  it("getById queries by id", async () => {
    await timelineService.getById("te-1");

    expect(prismaMock.timelineEvent.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "te-1" } }),
    );
  });

  it("update passes data and id", async () => {
    await timelineService.update("te-1", { title: "Updated" } as any);

    expect(prismaMock.timelineEvent.update).toHaveBeenCalledWith({ where: { id: "te-1" }, data: { title: "Updated" } });
  });

  it("delete passes id", async () => {
    await timelineService.delete("te-1");

    expect(prismaMock.timelineEvent.delete).toHaveBeenCalledWith({ where: { id: "te-1" } });
  });

  it("addCharacter creates a timelineEventCharacter record", async () => {
    await timelineService.addCharacter("te-1", "char-1", "Was present");

    expect(prismaMock.timelineEventCharacter.create).toHaveBeenCalledWith({
      data: { timelineEventId: "te-1", characterId: "char-1", notes: "Was present" },
    });
  });

  it("removeCharacter deletes by composite key", async () => {
    await timelineService.removeCharacter("te-1", "char-1");

    expect(prismaMock.timelineEventCharacter.delete).toHaveBeenCalledWith({
      where: { timelineEventId_characterId: { timelineEventId: "te-1", characterId: "char-1" } },
    });
  });
});

describe("itemService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll scopes query by bookId", async () => {
    await itemService.getAll(BOOK_ID);

    expect(prismaMock.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bookId: BOOK_ID } }),
    );
  });

  it("getAll includes location, characters, plotEvents and orders by createdAt desc", async () => {
    await itemService.getAll(BOOK_ID);

    expect(prismaMock.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          location: true,
          characters: { include: { character: true } },
          plotEvents: { include: { plotEvent: true } },
        }),
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("create merges bookId into data", async () => {
    const data = { name: "Magic Sword" };

    await itemService.create(data as any, BOOK_ID);

    expect(prismaMock.item.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookId: BOOK_ID, name: "Magic Sword" }),
      }),
    );
  });

  it("getById queries by id", async () => {
    await itemService.getById("item-1");

    expect(prismaMock.item.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1" } }),
    );
  });

  it("update passes data and id", async () => {
    await itemService.update("item-1", { name: "Updated" } as any);

    expect(prismaMock.item.update).toHaveBeenCalledWith({ where: { id: "item-1" }, data: { name: "Updated" } });
  });

  it("delete passes id", async () => {
    await itemService.delete("item-1");

    expect(prismaMock.item.delete).toHaveBeenCalledWith({ where: { id: "item-1" } });
  });
});

describe("searchService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("globalSearch scopes all 9 findMany calls by bookId", async () => {
    await searchService.globalSearch("test", BOOK_ID);

    // All 9 entity types should be queried with bookId in where clause
    expect(prismaMock.character.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ bookId: BOOK_ID }),
      }),
    );
    expect(prismaMock.power.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ bookId: BOOK_ID }),
      }),
    );
    expect(prismaMock.motivation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ bookId: BOOK_ID }),
      }),
    );
    expect(prismaMock.faction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ bookId: BOOK_ID }),
      }),
    );
    expect(prismaMock.location.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ bookId: BOOK_ID }),
      }),
    );
    expect(prismaMock.storyArc.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ bookId: BOOK_ID }),
      }),
    );
    expect(prismaMock.plotEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ bookId: BOOK_ID }),
      }),
    );
    expect(prismaMock.timelineEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ bookId: BOOK_ID }),
      }),
    );
    expect(prismaMock.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ bookId: BOOK_ID }),
      }),
    );
  });

  it("globalSearch passes query as case-insensitive contains filter", async () => {
    await searchService.globalSearch("dragon", BOOK_ID);

    // Check a representative sample uses the name contains pattern
    expect(prismaMock.character.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: "dragon", mode: "insensitive" },
        }),
      }),
    );
    expect(prismaMock.power.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: "dragon", mode: "insensitive" },
        }),
      }),
    );
    // storyArc and plotEvent use "title" instead of "name"
    expect(prismaMock.storyArc.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          title: { contains: "dragon", mode: "insensitive" },
        }),
      }),
    );
    expect(prismaMock.plotEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          title: { contains: "dragon", mode: "insensitive" },
        }),
      }),
    );
    expect(prismaMock.timelineEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          title: { contains: "dragon", mode: "insensitive" },
        }),
      }),
    );
  });

  it("globalSearch returns results tagged with entityType", async () => {
    prismaMock.character.findMany.mockResolvedValueOnce([
      { id: "c1", name: "Hero", type: "PROTAGONIST" },
    ]);
    prismaMock.item.findMany.mockResolvedValueOnce([
      { id: "i1", name: "Sword", type: "WEAPON" },
    ]);

    const results = await searchService.globalSearch("test", BOOK_ID);

    expect(results.characters).toEqual([
      { id: "c1", name: "Hero", type: "PROTAGONIST", entityType: "character" },
    ]);
    expect(results.items).toEqual([
      { id: "i1", name: "Sword", type: "WEAPON", entityType: "item" },
    ]);
  });
});
