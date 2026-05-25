"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";
const STORAGE_KEY = "tryaksh-theme";

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readInitialTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const root = document.documentElement;
    if (next === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "size-9 grid place-items-center border border-rule-2 bg-paper-2 text-ink-2 transition-colors",
        "hover:text-ink hover:bg-paper-3",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Both icons rendered; visibility switches per theme to avoid layout shift */}
      {mounted ? (
        theme === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        // Pre-mount placeholder — keeps the box stable while we read the theme
        <Moon className="size-4 opacity-40" />
      )}
    </button>
  );
}
