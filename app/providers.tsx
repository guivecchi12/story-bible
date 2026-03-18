"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
import { BookProvider } from "@/lib/contexts/book-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider>
          <BookProvider>{children}</BookProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
