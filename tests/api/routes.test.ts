import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetBookContext,
  mockCharacterService,
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
vi.mock("@/lib/services", () => ({ characterService: mockCharacterService }));
vi.mock("@/lib/validation", () => ({ characterSchema: mockCharacterSchema }));
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
