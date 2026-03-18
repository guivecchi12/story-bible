import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, setActiveBookId } from "@/lib/api";

const mockFetch = vi.fn().mockResolvedValue(new Response("ok"));

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockClear();
  setActiveBookId(null);
});

describe("apiFetch", () => {
  it("calls fetch with the given URL and options", async () => {
    await apiFetch("/api/test", { method: "POST" });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/test");
    expect(options.method).toBe("POST");
  });

  it("adds x-book-id header when activeBookId is set", async () => {
    setActiveBookId("book-123");
    await apiFetch("/api/test");

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get("x-book-id")).toBe("book-123");
  });

  it("does NOT add x-book-id header when activeBookId is null", async () => {
    setActiveBookId(null);
    await apiFetch("/api/test");

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options?.headers);
    expect(headers.has("x-book-id")).toBe(false);
  });

  it("reflects changes from setActiveBookId in subsequent calls", async () => {
    setActiveBookId("book-1");
    await apiFetch("/api/test");

    const [, options1] = mockFetch.mock.calls[0];
    const headers1 = new Headers(options1.headers);
    expect(headers1.get("x-book-id")).toBe("book-1");

    setActiveBookId("book-2");
    await apiFetch("/api/test");

    const [, options2] = mockFetch.mock.calls[1];
    const headers2 = new Headers(options2.headers);
    expect(headers2.get("x-book-id")).toBe("book-2");
  });

  it("preserves existing headers from options", async () => {
    await apiFetch("/api/test", {
      headers: { "Content-Type": "application/json" },
    });

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("merges x-book-id with other custom headers", async () => {
    setActiveBookId("book-123");
    await apiFetch("/api/test", {
      headers: { Authorization: "Bearer token", "Content-Type": "application/json" },
    });

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get("x-book-id")).toBe("book-123");
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});
