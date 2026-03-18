import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetServerSession, mockPrisma } = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockPrisma: {
    user: { findUnique: vi.fn() },
    bookMember: { findUnique: vi.fn() },
  },
}));

vi.mock("next-auth", () => ({ getServerSession: mockGetServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

import { getBookContext } from "@/lib/book-context";

describe("getBookContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const result = await getBookContext(
      new Request("http://localhost", { headers: { "x-book-id": "book-1" } }),
    );

    expect(result).toBeNull();
  });

  it("returns null when session has no user", async () => {
    mockGetServerSession.mockResolvedValue({ user: null });

    const result = await getBookContext(
      new Request("http://localhost", { headers: { "x-book-id": "book-1" } }),
    );

    expect(result).toBeNull();
  });

  it("returns null when no bookId (no header, no activeBookId)", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1", name: "Test" },
    });
    mockPrisma.user.findUnique.mockResolvedValue({ activeBookId: null });

    const result = await getBookContext(new Request("http://localhost"));

    expect(result).toBeNull();
  });

  it("returns null when user is not a member of the book", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1", name: "Test" },
    });
    mockPrisma.bookMember.findUnique.mockResolvedValue(null);

    const result = await getBookContext(
      new Request("http://localhost", { headers: { "x-book-id": "book-1" } }),
    );

    expect(result).toBeNull();
  });

  it("returns context with bookId from x-book-id header", async () => {
    const session = { user: { id: "user-1", name: "Test" } };
    mockGetServerSession.mockResolvedValue(session);
    mockPrisma.bookMember.findUnique.mockResolvedValue({
      bookId: "book-1",
      userId: "user-1",
      role: "owner",
    });

    const result = await getBookContext(
      new Request("http://localhost", { headers: { "x-book-id": "book-1" } }),
    );

    expect(result).toEqual({
      session,
      userId: "user-1",
      bookId: "book-1",
      role: "owner",
    });
    // Should not query user for activeBookId when header is present
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("falls back to activeBookId when no header", async () => {
    const session = { user: { id: "user-1", name: "Test" } };
    mockGetServerSession.mockResolvedValue(session);
    mockPrisma.user.findUnique.mockResolvedValue({
      activeBookId: "book-2",
    });
    mockPrisma.bookMember.findUnique.mockResolvedValue({
      bookId: "book-2",
      userId: "user-1",
      role: "collaborator",
    });

    const result = await getBookContext(new Request("http://localhost"));

    expect(result).toEqual({
      session,
      userId: "user-1",
      bookId: "book-2",
      role: "collaborator",
    });
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { activeBookId: true },
    });
  });

  it("returns correct role from BookMember", async () => {
    const session = { user: { id: "user-1", name: "Test" } };
    mockGetServerSession.mockResolvedValue(session);
    mockPrisma.bookMember.findUnique.mockResolvedValue({
      bookId: "book-1",
      userId: "user-1",
      role: "viewer",
    });

    const result = await getBookContext(
      new Request("http://localhost", { headers: { "x-book-id": "book-1" } }),
    );

    expect(result).toEqual({
      session,
      userId: "user-1",
      bookId: "book-1",
      role: "viewer",
    });
  });

  it("header takes precedence over activeBookId", async () => {
    const session = { user: { id: "user-1", name: "Test" } };
    mockGetServerSession.mockResolvedValue(session);
    mockPrisma.user.findUnique.mockResolvedValue({
      activeBookId: "book-active",
    });
    mockPrisma.bookMember.findUnique.mockResolvedValue({
      bookId: "book-header",
      userId: "user-1",
      role: "owner",
    });

    const result = await getBookContext(
      new Request("http://localhost", {
        headers: { "x-book-id": "book-header" },
      }),
    );

    expect(result).toEqual({
      session,
      userId: "user-1",
      bookId: "book-header",
      role: "owner",
    });
    // Should not have queried for activeBookId since header was present
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    // Should have looked up membership with the header bookId
    expect(mockPrisma.bookMember.findUnique).toHaveBeenCalledWith({
      where: {
        bookId_userId: { bookId: "book-header", userId: "user-1" },
      },
    });
  });

  it("returns null when called without a request and no activeBookId", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1", name: "Test" },
    });
    mockPrisma.user.findUnique.mockResolvedValue({ activeBookId: null });

    const result = await getBookContext();

    expect(result).toBeNull();
  });
});
