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
} from "lucide-react";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();
  const { books, activeBook, switchBook, refreshBooks } = useBook();
  const isOwner = activeBook?.role === "owner";
  const [open, setOpen] = useState(false);
  const [bookMenuOpen, setBookMenuOpen] = useState(false);
  const [creatingBook, setCreatingBook] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const bookMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bookMenuRef.current && !bookMenuRef.current.contains(e.target as Node)) {
        setBookMenuOpen(false);
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
                <span className="truncate font-medium">{activeBook?.name || "Select book"}</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", bookMenuOpen && "rotate-180")} />
              </button>
              {bookMenuOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-background shadow-lg">
                  <div className="max-h-48 overflow-y-auto p-1">
                    {books.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => { switchBook(book.id); setBookMenuOpen(false); }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors",
                          book.id === activeBook?.id ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                        )}
                      >
                        <span className="truncate">{book.name}</span>
                        <span className="text-xs opacity-70 capitalize">{book.role}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t p-1">
                    {creatingBook ? (
                      <form onSubmit={handleCreateBook} className="flex gap-1 p-1">
                        <input
                          autoFocus
                          value={newBookName}
                          onChange={(e) => setNewBookName(e.target.value)}
                          placeholder="Book name..."
                          className="flex-1 rounded-sm border bg-background px-2 py-1 text-sm"
                        />
                        <button type="submit" className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-foreground">
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
