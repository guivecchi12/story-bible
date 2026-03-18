"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useBook } from "@/lib/contexts/book-context";

export function Navbar() {
  const { data: session } = useSession();
  const { activeBook } = useBook();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b bg-background/95 backdrop-blur px-6 md:px-8">
      {session?.user && (
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {session.user.name || session.user.email}
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
              {activeBook?.role || "—"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      )}
    </header>
  );
}
