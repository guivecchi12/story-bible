import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  inviteSchema,
  characterSchema,
  powerSchema,
  motivationSchema,
  factionSchema,
  locationSchema,
  storyArcSchema,
  plotEventSchema,
  timelineEventSchema,
  itemSchema,
} from "@/lib/validation";

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "secret123" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email address");
    }
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must be at least 6 characters",
      );
    }
  });
});

// ---------------------------------------------------------------------------
// registerSchema
// ---------------------------------------------------------------------------
describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = registerSchema.safeParse({
      email: "alice@example.com",
      password: "password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "alice@example.com",
      password: "password1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects name longer than 100 characters", () => {
    const result = registerSchema.safeParse({
      name: "a".repeat(101),
      email: "alice@example.com",
      password: "password1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts name exactly 100 characters", () => {
    const result = registerSchema.safeParse({
      name: "a".repeat(100),
      email: "alice@example.com",
      password: "password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Alice",
      email: "bad",
      password: "password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// inviteSchema
// ---------------------------------------------------------------------------
describe("inviteSchema", () => {
  it("accepts valid collaborator invite", () => {
    const result = inviteSchema.safeParse({
      email: "bob@example.com",
      role: "collaborator",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid viewer invite", () => {
    const result = inviteSchema.safeParse({
      email: "bob@example.com",
      role: "viewer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = inviteSchema.safeParse({
      email: "nope",
      role: "viewer",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing role", () => {
    const result = inviteSchema.safeParse({ email: "bob@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role enum value", () => {
    const result = inviteSchema.safeParse({
      email: "bob@example.com",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// characterSchema
// ---------------------------------------------------------------------------
describe("characterSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = characterSchema.safeParse({
      name: "Gandalf",
      type: "main",
      description: "A wizard",
      backstory: "Long ago...",
      factionId: "faction-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with only required fields", () => {
    const result = characterSchema.safeParse({
      name: "Frodo",
      type: "supporting",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = characterSchema.safeParse({ name: "", type: "main" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects name longer than 200 characters", () => {
    const result = characterSchema.safeParse({
      name: "a".repeat(201),
      type: "main",
    });
    expect(result.success).toBe(false);
  });

  it("accepts name exactly 200 characters", () => {
    const result = characterSchema.safeParse({
      name: "a".repeat(200),
      type: "main",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type enum value", () => {
    const result = characterSchema.safeParse({
      name: "Gandalf",
      type: "villain",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const result = characterSchema.safeParse({ name: "Gandalf" });
    expect(result.success).toBe(false);
  });

  it("allows nullable factionId", () => {
    const result = characterSchema.safeParse({
      name: "Gandalf",
      type: "main",
      factionId: null,
    });
    expect(result.success).toBe(true);
  });

  it("allows omitted optional fields", () => {
    const result = characterSchema.safeParse({
      name: "Gandalf",
      type: "main",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.backstory).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// powerSchema
// ---------------------------------------------------------------------------
describe("powerSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = powerSchema.safeParse({
      name: "Fireball",
      effects: "Burns things",
      rules: "Costs mana",
      weaknesses: "Water",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with only required fields", () => {
    const result = powerSchema.safeParse({ name: "Telekinesis" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = powerSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects name longer than 200 characters", () => {
    const result = powerSchema.safeParse({ name: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = powerSchema.safeParse({ effects: "Burns things" });
    expect(result.success).toBe(false);
  });

  it("allows omitted optional fields", () => {
    const result = powerSchema.safeParse({ name: "Fireball" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.effects).toBeUndefined();
      expect(result.data.rules).toBeUndefined();
      expect(result.data.weaknesses).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// motivationSchema
// ---------------------------------------------------------------------------
describe("motivationSchema", () => {
  it("accepts valid input", () => {
    const result = motivationSchema.safeParse({
      name: "Revenge",
      description: "Seeking justice",
      category: "personal",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid category values", () => {
    for (const category of ["personal", "political", "emotional", "survival"]) {
      const result = motivationSchema.safeParse({
        name: "Test",
        category,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects empty name", () => {
    const result = motivationSchema.safeParse({
      name: "",
      category: "personal",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects name longer than 200 characters", () => {
    const result = motivationSchema.safeParse({
      name: "a".repeat(201),
      category: "personal",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = motivationSchema.safeParse({
      name: "Revenge",
      category: "financial",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing category", () => {
    const result = motivationSchema.safeParse({ name: "Revenge" });
    expect(result.success).toBe(false);
  });

  it("allows omitted description", () => {
    const result = motivationSchema.safeParse({
      name: "Revenge",
      category: "personal",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// factionSchema
// ---------------------------------------------------------------------------
describe("factionSchema", () => {
  it("accepts valid input", () => {
    const result = factionSchema.safeParse({
      name: "The Fellowship",
      description: "A group of heroes",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input without description", () => {
    const result = factionSchema.safeParse({ name: "The Fellowship" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = factionSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects name longer than 200 characters", () => {
    const result = factionSchema.safeParse({ name: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = factionSchema.safeParse({ description: "Desc" });
    expect(result.success).toBe(false);
  });

  it("allows omitted description", () => {
    const result = factionSchema.safeParse({ name: "The Order" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// locationSchema
// ---------------------------------------------------------------------------
describe("locationSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = locationSchema.safeParse({
      name: "Minas Tirith",
      type: "city",
      description: "The White City",
      climate: "Temperate",
      culture: "Gondorian",
      parentId: "region-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with only required fields", () => {
    const result = locationSchema.safeParse({
      name: "Middle-earth",
      type: "continent",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid type values", () => {
    for (const type of [
      "continent",
      "region",
      "city",
      "building",
      "landmark",
    ]) {
      const result = locationSchema.safeParse({ name: "Test", type });
      expect(result.success).toBe(true);
    }
  });

  it("rejects empty name", () => {
    const result = locationSchema.safeParse({ name: "", type: "city" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects name longer than 200 characters", () => {
    const result = locationSchema.safeParse({
      name: "a".repeat(201),
      type: "city",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type enum value", () => {
    const result = locationSchema.safeParse({
      name: "Test",
      type: "village",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const result = locationSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(false);
  });

  it("allows nullable parentId", () => {
    const result = locationSchema.safeParse({
      name: "Test",
      type: "city",
      parentId: null,
    });
    expect(result.success).toBe(true);
  });

  it("allows omitted optional fields", () => {
    const result = locationSchema.safeParse({
      name: "Test",
      type: "region",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.climate).toBeUndefined();
      expect(result.data.culture).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// storyArcSchema
// ---------------------------------------------------------------------------
describe("storyArcSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = storyArcSchema.safeParse({
      title: "The War of the Ring",
      description: "The final war",
      type: "main",
      status: "active",
      parentArcId: "arc-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with only required fields and applies default status", () => {
    const result = storyArcSchema.safeParse({
      title: "Side Quest",
      type: "subplot",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("planned");
    }
  });

  it("accepts all valid type values", () => {
    for (const type of ["main", "subplot", "character_arc"]) {
      const result = storyArcSchema.safeParse({ title: "Test", type });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid status values", () => {
    for (const status of ["planned", "active", "resolved"]) {
      const result = storyArcSchema.safeParse({
        title: "Test",
        type: "main",
        status,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects empty title", () => {
    const result = storyArcSchema.safeParse({ title: "", type: "main" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Title is required");
    }
  });

  it("rejects title longer than 300 characters", () => {
    const result = storyArcSchema.safeParse({
      title: "a".repeat(301),
      type: "main",
    });
    expect(result.success).toBe(false);
  });

  it("accepts title exactly 300 characters", () => {
    const result = storyArcSchema.safeParse({
      title: "a".repeat(300),
      type: "main",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type enum value", () => {
    const result = storyArcSchema.safeParse({
      title: "Test",
      type: "epilogue",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status enum value", () => {
    const result = storyArcSchema.safeParse({
      title: "Test",
      type: "main",
      status: "archived",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const result = storyArcSchema.safeParse({ title: "Test" });
    expect(result.success).toBe(false);
  });

  it("allows nullable parentArcId", () => {
    const result = storyArcSchema.safeParse({
      title: "Test",
      type: "main",
      parentArcId: null,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// plotEventSchema
// ---------------------------------------------------------------------------
describe("plotEventSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = plotEventSchema.safeParse({
      title: "Battle of Helm's Deep",
      description: "A great battle",
      consequence: "Victory for Rohan",
      order: 5,
      storyArcId: "arc-1",
      locationId: "loc-1",
      timelineEventId: "tl-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with only required fields and applies default order", () => {
    const result = plotEventSchema.safeParse({
      title: "The Council",
      storyArcId: "arc-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe(0);
    }
  });

  it("rejects empty title", () => {
    const result = plotEventSchema.safeParse({
      title: "",
      storyArcId: "arc-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Title is required");
    }
  });

  it("rejects title longer than 300 characters", () => {
    const result = plotEventSchema.safeParse({
      title: "a".repeat(301),
      storyArcId: "arc-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing storyArcId", () => {
    const result = plotEventSchema.safeParse({ title: "The Council" });
    expect(result.success).toBe(false);
  });

  it("rejects empty storyArcId", () => {
    const result = plotEventSchema.safeParse({
      title: "The Council",
      storyArcId: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes("storyArcId"),
      );
      expect(issue?.message).toBe("Story Arc is required");
    }
  });

  it("allows nullable locationId", () => {
    const result = plotEventSchema.safeParse({
      title: "The Council",
      storyArcId: "arc-1",
      locationId: null,
    });
    expect(result.success).toBe(true);
  });

  it("allows nullable timelineEventId", () => {
    const result = plotEventSchema.safeParse({
      title: "The Council",
      storyArcId: "arc-1",
      timelineEventId: null,
    });
    expect(result.success).toBe(true);
  });

  it("allows omitted optional fields", () => {
    const result = plotEventSchema.safeParse({
      title: "The Council",
      storyArcId: "arc-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.consequence).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// timelineEventSchema
// ---------------------------------------------------------------------------
describe("timelineEventSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = timelineEventSchema.safeParse({
      title: "The Fall of Numenor",
      description: "The island sinks",
      inWorldDate: "SA 3319",
      era: "Second Age",
      order: 1,
      locationId: "loc-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with only required fields and applies default order", () => {
    const result = timelineEventSchema.safeParse({
      title: "The Awakening",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe(0);
    }
  });

  it("rejects empty title", () => {
    const result = timelineEventSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Title is required");
    }
  });

  it("rejects title longer than 300 characters", () => {
    const result = timelineEventSchema.safeParse({
      title: "a".repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it("accepts title exactly 300 characters", () => {
    const result = timelineEventSchema.safeParse({
      title: "a".repeat(300),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = timelineEventSchema.safeParse({
      order: 1,
      locationId: "loc-1",
    });
    expect(result.success).toBe(false);
  });

  it("allows nullable locationId", () => {
    const result = timelineEventSchema.safeParse({
      title: "Test",
      locationId: null,
    });
    expect(result.success).toBe(true);
  });

  it("allows omitted optional fields", () => {
    const result = timelineEventSchema.safeParse({ title: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.inWorldDate).toBeUndefined();
      expect(result.data.era).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// itemSchema
// ---------------------------------------------------------------------------
describe("itemSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = itemSchema.safeParse({
      name: "Excalibur",
      type: "weapon",
      description: "A legendary sword",
      lore: "Pulled from stone",
      properties: "Indestructible",
      locationId: "loc-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with only required fields", () => {
    const result = itemSchema.safeParse({
      name: "Ring of Power",
      type: "artifact",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid type values", () => {
    for (const type of ["weapon", "artifact", "relic", "tool", "symbol"]) {
      const result = itemSchema.safeParse({ name: "Test", type });
      expect(result.success).toBe(true);
    }
  });

  it("rejects empty name", () => {
    const result = itemSchema.safeParse({ name: "", type: "weapon" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects name longer than 200 characters", () => {
    const result = itemSchema.safeParse({
      name: "a".repeat(201),
      type: "weapon",
    });
    expect(result.success).toBe(false);
  });

  it("accepts name exactly 200 characters", () => {
    const result = itemSchema.safeParse({
      name: "a".repeat(200),
      type: "weapon",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type enum value", () => {
    const result = itemSchema.safeParse({ name: "Test", type: "potion" });
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const result = itemSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(false);
  });

  it("allows nullable locationId", () => {
    const result = itemSchema.safeParse({
      name: "Test",
      type: "relic",
      locationId: null,
    });
    expect(result.success).toBe(true);
  });

  it("allows omitted optional fields", () => {
    const result = itemSchema.safeParse({
      name: "Test",
      type: "tool",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.lore).toBeUndefined();
      expect(result.data.properties).toBeUndefined();
    }
  });
});
