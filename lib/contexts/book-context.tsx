"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { setActiveBookId } from "@/lib/api";

interface Book {
  id: string;
  name: string;
  description: string | null;
  role: string;
}

interface BookContextType {
  books: Book[];
  activeBook: Book | null;
  loading: boolean;
  switchBook: (bookId: string) => Promise<void>;
  refreshBooks: () => Promise<void>;
}

const BookContext = createContext<BookContextType>({
  books: [],
  activeBook: null,
  loading: true,
  switchBook: async () => {},
  refreshBooks: async () => {},
});

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/books");
      if (!res.ok) return;
      const data = await res.json();
      setBooks(data.books);
      if (data.activeBookId) {
        const active = data.books.find((b: Book) => b.id === data.activeBookId);
        setActiveBook(active || data.books[0] || null);
      } else if (data.books.length > 0) {
        setActiveBook(data.books[0]);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBooks();
  }, [refreshBooks]);

  useEffect(() => {
    setActiveBookId(activeBook?.id ?? null);
  }, [activeBook]);

  const switchBook = async (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    setActiveBook(book);
    await fetch("/api/user/active-book", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
  };

  return (
    <BookContext.Provider value={{ books, activeBook, loading, switchBook, refreshBooks }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBook() {
  return useContext(BookContext);
}
