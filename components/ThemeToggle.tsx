"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

const themes = ["light", "dark", "system"] as const;
const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    fetch("/api/user/theme").then((res) => {
      if (res.ok) return res.json();
    }).then((data) => {
      if (data?.theme) setTheme(data.theme);
    }).catch(() => {});
  }, [mounted]);

  const cycleTheme = () => {
    const current = themes.indexOf(theme as any);
    const next = themes[(current + 1) % themes.length];
    setTheme(next);
    fetch("/api/user/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {});
  };

  if (!mounted) return <Button variant="ghost" size="icon" className="h-9 w-9" />;

  const Icon = icons[(theme as keyof typeof icons) ?? "system"];

  return (
    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={cycleTheme} title={`Theme: ${theme}`}>
      <Icon className="h-4 w-4" />
    </Button>
  );
}
