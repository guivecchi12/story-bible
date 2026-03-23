import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetBookContext,
  mockCharacterService,
  mockFactionService,
  mockPlotEventService,
  mockTimelineService,
  mockCharacterSchema,
  mockGetServerSession,
  mockPrisma,
} = vi.hoisted(() => ({
  mockGetBookContext: vi.fn(),
  mockCharacterService: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    create: vi
      .fn()
      .mockResolvedValue({ id: "char-1", name: "Test", type: "main" }),
    update: vi
      .fn()
      .mockResolvedValue({ id: "char-1", name: "Updated", type: "main" }),
    delete: vi.fn().mockResolvedValue({}),
    addPower: vi.fn().mockResolvedValue({}),
    removePower: vi.fn().mockResolvedValue({}),
    addMotivation: vi.fn().mockResolvedValue({}),
    removeMotivation: vi.fn().mockResolvedValue({}),
    addLocation: vi.fn().mockResolvedValue({}),
    removeLocation: vi.fn().mockResolvedValue({}),
    addItem: vi.fn().mockResolvedValue({}),
    removeItem: vi.fn().mockResolvedValue({}),
  },
  mockFactionService: {
    addMotivation: vi.fn().mockResolvedValue({}),
    removeMotivation: vi.fn().mockResolvedValue({}),
  },
  mockPlotEventService: {
    addCharacter: vi.fn().mockResolvedValue({}),
    removeCharacter: vi.fn().mockResolvedValue({}),
    addItem: vi.fn().mockResolvedValue({}),
    removeItem: vi.fn().mockResolvedValue({}),
  },
  mockTimelineService: {
    setCharacterState: vi.fn().mockResolvedValue({}),
    removeCharacterState: vi.fn().mockResolvedValue({}),
  },
  mockCharacterSchema: {
    safeParse: vi.fn().mockReturnValue({
      success: true,
      data: { name: "Test", type: "main" },
    }),
    partial: vi.fn().mockReturnValue({
      safeParse: vi.fn().mockReturnValue({
        success: true,
        data: { name: "Updated" },
      }),
    }),
  },
  mockGetServerSession: vi.fn(),
  mockPrisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    bookMember: { findMany: vi.fn(), findUnique: vi.fn() },
    book: { create: vi.fn() },
  },
}));

vi.mock("@/lib/book-context", () => ({ getBookContext: mockGetBookContext }));
vi.mock("@/lib/services", () => ({
  characterService: mockCharacterService,
  factionService: mockFactionService,
  plotEventService: mockPlotEventService,
  timelineService: mockTimelineService,
}));
vi.mock("@/lib/validation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/validation")>();
  return { ...actual, characterSchema: mockCharacterSchema };
});
vi.mock("next-auth", () => ({ getServerSession: mockGetServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

import { GET, POST } from "@/app/api/characters/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from "@/app/api/characters/[id]/route";
import { GET as BOOKS_GET, POST as BOOKS_POST } from "@/app/api/books/route";

// Relationship route imports
import { POST as CHAR_POWERS_POST, DELETE as CHAR_POWERS_DELETE } from "@/app/api/characters/[id]/powers/route";
import { POST as CHAR_MOTIVATIONS_POST, DELETE as CHAR_MOTIVATIONS_DELETE } from "@/app/api/characters/[id]/motivations/route";
import { POST as CHAR_LOCATIONS_POST, DELETE as CHAR_LOCATIONS_DELETE } from "@/app/api/characters/[id]/locations/route";
import { POST as CHAR_ITEMS_POST, DELETE as CHAR_ITEMS_DELETE } from "@/app/api/characters/[id]/items/route";
import { POST as FACTION_MOTIVATIONS_POST, DELETE as FACTION_MOTIVATIONS_DELETE } from "@/app/api/factions/[id]/motivations/route";
import { POST as PE_CHARACTERS_POST, DELETE as PE_CHARACTERS_DELETE } from "@/app/api/plot-events/[id]/characters/route";
import { POST as PE_ITEMS_POST, DELETE as PE_ITEMS_DELETE } from "@/app/api/plot-events/[id]/items/route";
import { POST as TL_CHARACTERS_POST, DELETE as TL_CHARACTERS_DELETE } from "@/app/api/timeline/[id]/characters/route";

// --- Helpers ---
function makeRequest(
  url: string,
  options?: RequestInit & { headers?: Record<string, string> },
) {
  return new Request(url, options);
}

function makeJsonRequest(url: string, method: string, body: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ============================================================
// Characters collection route: /api/characters
// ============================================================
describe("GET /api/characters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when getBookContext returns null", async () => {
    mockGetBookContext.mockResolvedValue(null);

    const res = await GET(makeRequest("http://localhost/api/characters"));

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns characters list when authenticated", async () => {
    const characters = [
      { id: "c1", name: "Alice" },
      { id: "c2", name: "Bob" },
    ];
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "owner",
    });
    mockCharacterService.getAll.mockResolvedValue(characters);

    const res = await GET(makeRequest("http://localhost/api/characters"));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(characters);
  });

  it("passes bookId to service.getAll", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-42",
      role: "owner",
    });
    mockCharacterService.getAll.mockResolvedValue([]);

    await GET(makeRequest("http://localhost/api/characters"));

    expect(mockCharacterService.getAll).toHaveBeenCalledWith("book-42");
  });
});

describe("POST /api/characters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset partial mock
    mockCharacterSchema.partial.mockReturnValue({
      safeParse: vi.fn().mockReturnValue({
        success: true,
        data: { name: "Updated" },
      }),
    });
    mockCharacterSchema.safeParse.mockReturnValue({
      success: true,
      data: { name: "Test", type: "main" },
    });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetBookContext.mockResolvedValue(null);

    const res = await POST(
      makeJsonRequest("http://localhost/api/characters", "POST", {
        name: "Test",
        type: "main",
      }),
    );

    expect(res.status).toBe(401);
  });

  it("returns 403 when role is viewer", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "viewer",
    });

    const res = await POST(
      makeJsonRequest("http://localhost/api/characters", "POST", {
        name: "Test",
        type: "main",
      }),
    );

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Forbidden");
  });

  it("creates character with bookId when role is owner", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "owner",
    });

    const res = await POST(
      makeJsonRequest("http://localhost/api/characters", "POST", {
        name: "Test",
        type: "main",
      }),
    );

    expect(res.status).toBe(201);
    expect(mockCharacterService.create).toHaveBeenCalledWith(
      { name: "Test", type: "main" },
      "book-1",
    );
  });

  it("creates character with bookId when role is collaborator", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "collaborator",
    });

    const res = await POST(
      makeJsonRequest("http://localhost/api/characters", "POST", {
        name: "Test",
        type: "main",
      }),
    );

    expect(res.status).toBe(201);
    expect(mockCharacterService.create).toHaveBeenCalledWith(
      { name: "Test", type: "main" },
      "book-1",
    );
  });

  it("returns 400 on validation error", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "owner",
    });
    mockCharacterSchema.safeParse.mockReturnValue({
      success: false,
      error: {
        flatten: () => ({ fieldErrors: { name: ["Name is required"] } }),
      },
    });

    const res = await POST(
      makeJsonRequest("http://localhost/api/characters", "POST", {
        name: "",
        type: "main",
      }),
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toEqual({ name: ["Name is required"] });
  });
});

// ============================================================
// Characters [id] route: /api/characters/[id]
// ============================================================
describe("GET /api/characters/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetBookContext.mockResolvedValue(null);

    const res = await GET_BY_ID(
      makeRequest("http://localhost/api/characters/char-1"),
      { params: { id: "char-1" } },
    );

    expect(res.status).toBe(401);
  });

  it("returns 404 when character not found", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "owner",
    });
    mockCharacterService.getById.mockResolvedValue(null);

    const res = await GET_BY_ID(
      makeRequest("http://localhost/api/characters/char-1"),
      { params: { id: "char-1" } },
    );

    expect(res.status).toBe(404);
  });

  it("returns character when found", async () => {
    const character = { id: "char-1", name: "Alice", type: "main" };
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "owner",
    });
    mockCharacterService.getById.mockResolvedValue(character);

    const res = await GET_BY_ID(
      makeRequest("http://localhost/api/characters/char-1"),
      { params: { id: "char-1" } },
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(character);
  });
});

describe("PUT /api/characters/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCharacterSchema.partial.mockReturnValue({
      safeParse: vi.fn().mockReturnValue({
        success: true,
        data: { name: "Updated" },
      }),
    });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetBookContext.mockResolvedValue(null);

    const res = await PUT(
      makeJsonRequest("http://localhost/api/characters/char-1", "PUT", {
        name: "Updated",
      }),
      { params: { id: "char-1" } },
    );

    expect(res.status).toBe(401);
  });

  it("returns 403 for viewer role", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "viewer",
    });

    const res = await PUT(
      makeJsonRequest("http://localhost/api/characters/char-1", "PUT", {
        name: "Updated",
      }),
      { params: { id: "char-1" } },
    );

    expect(res.status).toBe(403);
  });

  it("allows owner role", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "owner",
    });

    const res = await PUT(
      makeJsonRequest("http://localhost/api/characters/char-1", "PUT", {
        name: "Updated",
      }),
      { params: { id: "char-1" } },
    );

    expect(res.status).toBe(200);
    expect(mockCharacterService.update).toHaveBeenCalledWith("char-1", {
      name: "Updated",
    });
  });

  it("allows collaborator role", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "collaborator",
    });

    const res = await PUT(
      makeJsonRequest("http://localhost/api/characters/char-1", "PUT", {
        name: "Updated",
      }),
      { params: { id: "char-1" } },
    );

    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/characters/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetBookContext.mockResolvedValue(null);

    const res = await DELETE(
      makeRequest("http://localhost/api/characters/char-1"),
      { params: { id: "char-1" } },
    );

    expect(res.status).toBe(401);
  });

  it("returns 403 for viewer role", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "viewer",
    });

    const res = await DELETE(
      makeRequest("http://localhost/api/characters/char-1"),
      { params: { id: "char-1" } },
    );

    expect(res.status).toBe(403);
  });

  it("deletes character for owner role", async () => {
    mockGetBookContext.mockResolvedValue({
      session: {},
      userId: "user-1",
      bookId: "book-1",
      role: "owner",
    });

    const res = await DELETE(
      makeRequest("http://localhost/api/characters/char-1"),
      { params: { id: "char-1" } },
    );

    expect(res.status).toBe(200);
    expect(mockCharacterService.delete).toHaveBeenCalledWith("char-1");
  });
});

// ============================================================
// Books route: /api/books
// ============================================================
describe("GET /api/books", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const res = await BOOKS_GET();

    expect(res.status).toBe(401);
  });

  it("returns books list with activeBookId when authenticated", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1", name: "Test" },
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      activeBookId: "book-1",
    });
    mockPrisma.bookMember.findMany.mockResolvedValue([
      {
        role: "owner",
        book: { id: "book-1", name: "My Book", description: "A story" },
      },
    ]);

    const res = await BOOKS_GET();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      books: [
        {
          id: "book-1",
          name: "My Book",
          description: "A story",
          role: "owner",
        },
      ],
      activeBookId: "book-1",
    });
  });
});

describe("POST /api/books", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const res = await BOOKS_POST(
      makeJsonRequest("http://localhost/api/books", "POST", {
        name: "New Book",
      }),
    );

    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1", name: "Test" },
    });

    const res = await BOOKS_POST(
      makeJsonRequest("http://localhost/api/books", "POST", { name: "" }),
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Name is required");
  });

  it("creates book and sets it as active", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1", name: "Test" },
    });
    const createdBook = { id: "book-new", name: "New Book", description: null };
    mockPrisma.book.create.mockResolvedValue(createdBook);

    const res = await BOOKS_POST(
      makeJsonRequest("http://localhost/api/books", "POST", {
        name: "New Book",
      }),
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual(createdBook);
    expect(mockPrisma.book.create).toHaveBeenCalledWith({
      data: {
        name: "New Book",
        description: null,
        members: { create: { userId: "user-1", role: "owner" } },
      },
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { activeBookId: "book-new" },
    });
  });
});

// ============================================================
// Relationship routes
// ============================================================
const ownerCtx = { session: {}, userId: "user-1", bookId: "book-1", role: "owner" };
const viewerCtx = { session: {}, userId: "user-1", bookId: "book-1", role: "viewer" };
const params = { params: { id: "test-id" } };

describe("POST /api/characters/[id]/powers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetBookContext.mockResolvedValue(null);
    const res = await CHAR_POWERS_POST(makeJsonRequest("http://localhost/api/characters/c1/powers", "POST", { powerId: "p1" }), params);
    expect(res.status).toBe(401);
  });

  it("returns 403 for viewer role", async () => {
    mockGetBookContext.mockResolvedValue(viewerCtx);
    const res = await CHAR_POWERS_POST(makeJsonRequest("http://localhost/api/characters/c1/powers", "POST", { powerId: "p1" }), params);
    expect(res.status).toBe(403);
  });

  it("returns 400 when powerId is missing", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_POWERS_POST(makeJsonRequest("http://localhost/api/characters/c1/powers", "POST", {}), params);
    expect(res.status).toBe(400);
  });

  it("adds power for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_POWERS_POST(makeJsonRequest("http://localhost/api/characters/c1/powers", "POST", { powerId: "p1", strengthLevel: 8 }), params);
    expect(res.status).toBe(201);
    expect(mockCharacterService.addPower).toHaveBeenCalledWith("test-id", "p1", 8, false, undefined);
  });
});

describe("DELETE /api/characters/[id]/powers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes power for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_POWERS_DELETE(makeJsonRequest("http://localhost/api/characters/c1/powers", "DELETE", { powerId: "p1" }), params);
    expect(res.status).toBe(200);
    expect(mockCharacterService.removePower).toHaveBeenCalledWith("test-id", "p1");
  });
});

describe("POST /api/characters/[id]/motivations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when motivationId is missing", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_MOTIVATIONS_POST(makeJsonRequest("http://localhost/x", "POST", {}), params);
    expect(res.status).toBe(400);
  });

  it("adds motivation for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_MOTIVATIONS_POST(makeJsonRequest("http://localhost/x", "POST", { motivationId: "m1", priority: 3 }), params);
    expect(res.status).toBe(201);
    expect(mockCharacterService.addMotivation).toHaveBeenCalledWith("test-id", "m1", 3, undefined);
  });
});

describe("DELETE /api/characters/[id]/motivations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes motivation for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_MOTIVATIONS_DELETE(makeJsonRequest("http://localhost/x", "DELETE", { motivationId: "m1" }), params);
    expect(res.status).toBe(200);
    expect(mockCharacterService.removeMotivation).toHaveBeenCalledWith("test-id", "m1");
  });
});

describe("POST /api/characters/[id]/locations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when locationId or role is missing", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_LOCATIONS_POST(makeJsonRequest("http://localhost/x", "POST", { locationId: "l1" }), params);
    expect(res.status).toBe(400);
  });

  it("adds location for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_LOCATIONS_POST(makeJsonRequest("http://localhost/x", "POST", { locationId: "l1", role: "Resident" }), params);
    expect(res.status).toBe(201);
    expect(mockCharacterService.addLocation).toHaveBeenCalledWith("test-id", "l1", "Resident");
  });
});

describe("DELETE /api/characters/[id]/locations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes location for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_LOCATIONS_DELETE(makeJsonRequest("http://localhost/x", "DELETE", { locationId: "l1" }), params);
    expect(res.status).toBe(200);
    expect(mockCharacterService.removeLocation).toHaveBeenCalledWith("test-id", "l1");
  });
});

describe("POST /api/characters/[id]/items", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when itemId or status is missing", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_ITEMS_POST(makeJsonRequest("http://localhost/x", "POST", { itemId: "i1" }), params);
    expect(res.status).toBe(400);
  });

  it("adds item for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_ITEMS_POST(makeJsonRequest("http://localhost/x", "POST", { itemId: "i1", status: "owned" }), params);
    expect(res.status).toBe(201);
    expect(mockCharacterService.addItem).toHaveBeenCalledWith("test-id", "i1", "owned", undefined);
  });
});

describe("DELETE /api/characters/[id]/items", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes item for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await CHAR_ITEMS_DELETE(makeJsonRequest("http://localhost/x", "DELETE", { itemId: "i1" }), params);
    expect(res.status).toBe(200);
    expect(mockCharacterService.removeItem).toHaveBeenCalledWith("test-id", "i1");
  });
});

describe("POST /api/factions/[id]/motivations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 403 for viewer role", async () => {
    mockGetBookContext.mockResolvedValue(viewerCtx);
    const res = await FACTION_MOTIVATIONS_POST(makeJsonRequest("http://localhost/x", "POST", { motivationId: "m1" }), params);
    expect(res.status).toBe(403);
  });

  it("adds motivation for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await FACTION_MOTIVATIONS_POST(makeJsonRequest("http://localhost/x", "POST", { motivationId: "m1", priority: 2 }), params);
    expect(res.status).toBe(201);
    expect(mockFactionService.addMotivation).toHaveBeenCalledWith("test-id", "m1", 2, undefined);
  });
});

describe("DELETE /api/factions/[id]/motivations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes motivation for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await FACTION_MOTIVATIONS_DELETE(makeJsonRequest("http://localhost/x", "DELETE", { motivationId: "m1" }), params);
    expect(res.status).toBe(200);
    expect(mockFactionService.removeMotivation).toHaveBeenCalledWith("test-id", "m1");
  });
});

describe("POST /api/plot-events/[id]/characters", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when characterId or role is missing", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await PE_CHARACTERS_POST(makeJsonRequest("http://localhost/x", "POST", { characterId: "c1" }), params);
    expect(res.status).toBe(400);
  });

  it("adds character for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await PE_CHARACTERS_POST(makeJsonRequest("http://localhost/x", "POST", { characterId: "c1", role: "Protagonist" }), params);
    expect(res.status).toBe(201);
    expect(mockPlotEventService.addCharacter).toHaveBeenCalledWith("test-id", "c1", "Protagonist");
  });
});

describe("DELETE /api/plot-events/[id]/characters", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes character for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await PE_CHARACTERS_DELETE(makeJsonRequest("http://localhost/x", "DELETE", { characterId: "c1" }), params);
    expect(res.status).toBe(200);
    expect(mockPlotEventService.removeCharacter).toHaveBeenCalledWith("test-id", "c1");
  });
});

describe("POST /api/plot-events/[id]/items", () => {
  beforeEach(() => vi.clearAllMocks());

  it("adds item for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await PE_ITEMS_POST(makeJsonRequest("http://localhost/x", "POST", { itemId: "i1", role: "MacGuffin" }), params);
    expect(res.status).toBe(201);
    expect(mockPlotEventService.addItem).toHaveBeenCalledWith("test-id", "i1", "MacGuffin");
  });
});

describe("DELETE /api/plot-events/[id]/items", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes item for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await PE_ITEMS_DELETE(makeJsonRequest("http://localhost/x", "DELETE", { itemId: "i1" }), params);
    expect(res.status).toBe(200);
    expect(mockPlotEventService.removeItem).toHaveBeenCalledWith("test-id", "i1");
  });
});

describe("POST /api/timeline/[id]/characters", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when characterId is missing", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await TL_CHARACTERS_POST(makeJsonRequest("http://localhost/x", "POST", { status: "Healthy" }), params);
    expect(res.status).toBe(400);
  });

  it("sets character state for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await TL_CHARACTERS_POST(makeJsonRequest("http://localhost/x", "POST", { characterId: "c1", status: "Injured", notes: "Witness" }), params);
    expect(res.status).toBe(201);
    expect(mockTimelineService.setCharacterState).toHaveBeenCalledWith("test-id", expect.objectContaining({ characterId: "c1", status: "Injured" }));
  });
});

describe("DELETE /api/timeline/[id]/characters", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes character state for owner", async () => {
    mockGetBookContext.mockResolvedValue(ownerCtx);
    const res = await TL_CHARACTERS_DELETE(makeJsonRequest("http://localhost/x", "DELETE", { characterId: "c1" }), params);
    expect(res.status).toBe(200);
    expect(mockTimelineService.removeCharacterState).toHaveBeenCalledWith("test-id", "c1");
  });
});
