"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Zap,
  Heart,
  Shield,
  MapPin,
  BookOpen,
  GitBranch,
  Clock,
  Gem,
  FileText,
  Search,
  Settings,
  Menu,
  X,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useBook } from "@/lib/contexts/book-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/powers", label: "Powers", icon: Zap },
  { href: "/motivations", label: "Motivations", icon: Heart },
  { href: "/factions", label: "Factions", icon: Shield },
  { href: "/locations", label: "Locations", icon: MapPin },
  { href: "/story-arcs", label: "Story Arcs", icon: BookOpen },
  { href: "/plot-events", label: "Plot Events", icon: GitBranch },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/items", label: "Items", icon: Gem },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();
  const { books, activeBook, switchBook, refreshBooks } = useBook();
  const isOwner = activeBook?.role === "owner";
  const [open, setOpen] = useState(false);
  const [bookMenuOpen, setBookMenuOpen] = useState(false);
  const [creatingBook, setCreatingBook] = useState(false);
  const [newBookName, setNewBookName] = useState("");

  // Edit state
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Delete state
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

  const bookMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        bookMenuRef.current &&
        !bookMenuRef.current.contains(e.target as Node)
      ) {
        setBookMenuOpen(false);
        setEditingBookId(null);
        setDeletingBookId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleCreateBook(e: React.FormEvent) {
    e.preventDefault();
    if (!newBookName.trim()) return;
    await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBookName.trim() }),
    });
    setNewBookName("");
    setCreatingBook(false);
    setBookMenuOpen(false);
    refreshBooks();
  }

  function startEditing(
    bookId: string,
    currentName: string,
    e: React.MouseEvent,
  ) {
    e.stopPropagation();
    setDeletingBookId(null);
    setEditingBookId(bookId);
    setEditingName(currentName);
  }

  async function handleRenameBook(e: React.FormEvent, bookId: string) {
    e.preventDefault();
    if (!editingName.trim()) return;
    await fetch(`/api/books/${bookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    });
    setEditingBookId(null);
    refreshBooks();
  }

  function startDeleting(bookId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingBookId(null);
    setDeletingBookId(bookId === deletingBookId ? null : bookId);
  }

  async function handleDeleteBook(bookId: string) {
    await fetch(`/api/books/${bookId}`, { method: "DELETE" });
    setDeletingBookId(null);
    setBookMenuOpen(false);
    // If we deleted the active book, refreshBooks will handle switching
    refreshBooks();
  }

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 md:hidden rounded-md border bg-background p-2"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r bg-card transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-lg"
          >
            <BookOpen className="h-6 w-6 text-primary" />
            Story Bible
          </Link>
        </div>

        {/* Book Switcher */}
        {books.length > 0 && (
          <div className="px-4 pt-4 pb-2" ref={bookMenuRef}>
            <div className="relative">
              <button
                onClick={() => setBookMenuOpen(!bookMenuOpen)}
                className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <span className="truncate font-medium">
                  {activeBook?.name || "Select book"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    bookMenuOpen && "rotate-180",
                  )}
                />
              </button>

              {bookMenuOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-background shadow-lg">
                  <div className="max-h-64 overflow-y-auto p-1">
                    {books.map((book) => {
                      const isActive = book.id === activeBook?.id;
                      const isEditing = editingBookId === book.id;
                      const isConfirmingDelete = deletingBookId === book.id;
                      const canEdit = book.role === "owner";

                      if (isEditing) {
                        return (
                          <form
                            key={book.id}
                            onSubmit={(e) => handleRenameBook(e, book.id)}
                            className="flex items-center gap-1 px-1 py-1"
                          >
                            <input
                              autoFocus
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 rounded-sm border bg-background px-2 py-1 text-sm min-w-0"
                            />
                            <button
                              type="submit"
                              className="shrink-0 rounded-sm bg-primary p-1 text-primary-foreground"
                              title="Save"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingBookId(null)}
                              className="shrink-0 rounded-sm p-1 hover:bg-accent"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        );
                      }

                      if (isConfirmingDelete) {
                        return (
                          <div key={book.id} className="px-2 py-1.5">
                            <p className="text-xs text-muted-foreground mb-1.5 leading-snug">
                              Delete{" "}
                              <span className="font-medium text-foreground">
                                &quot;{book.name}&quot;
                              </span>
                              ? This cannot be undone.
                            </p>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDeleteBook(book.id)}
                                className="flex-1 rounded-sm bg-destructive px-2 py-1 text-xs text-destructive-foreground hover:opacity-90 transition-opacity"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeletingBookId(null)}
                                className="flex-1 rounded-sm border px-2 py-1 text-xs hover:bg-accent transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={book.id}
                          className={cn(
                            "group flex w-full items-center gap-1 rounded-sm px-1 py-0.5 text-sm transition-colors",
                            isActive ? "bg-primary/10" : "hover:bg-accent",
                          )}
                        >
                          {/* Select button */}
                          <button
                            onClick={() => {
                              switchBook(book.id);
                              setBookMenuOpen(false);
                            }}
                            className={cn(
                              "flex flex-1 items-center justify-between rounded-sm px-2 py-1.5 text-left min-w-0",
                              isActive && "font-medium text-primary",
                            )}
                          >
                            <span className="truncate">{book.name}</span>
                            <span className="ml-1 shrink-0 text-xs opacity-50 capitalize">
                              {book.role}
                            </span>
                          </button>

                          {/* Owner-only action icons */}
                          {canEdit && (
                            <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) =>
                                  startEditing(book.id, book.name, e)
                                }
                                className="rounded-sm p-1 hover:bg-accent"
                                title="Rename"
                              >
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                              </button>
                              <button
                                onClick={(e) => startDeleting(book.id, e)}
                                className="rounded-sm p-1 hover:bg-accent"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t p-1">
                    {creatingBook ? (
                      <form
                        onSubmit={handleCreateBook}
                        className="flex gap-1 p-1"
                      >
                        <input
                          autoFocus
                          value={newBookName}
                          onChange={(e) => setNewBookName(e.target.value)}
                          placeholder="Book name..."
                          className="flex-1 rounded-sm border bg-background px-2 py-1 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-foreground"
                        >
                          Add
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setCreatingBook(true)}
                        className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        New Book
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {isOwner && (
            <>
              <div className="my-2 border-t" />
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/settings"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </>
          )}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
