"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Controls from "@/components/Controls";
import PreviewGrid from "@/components/PreviewGrid";
import { usePreviewStore } from "@/lib/store";

/**
 * Main page — just composes the four top-level sections.
 * All state lives in the Zustand store (`lib/store.js`).
 *
 * Theme application:
 *   We keep the resolved theme ("light" | "dark") in sync with the
 *   `<html>` element's `.dark` class, reacting to both the user's explicit
 *   choice and — when they haven't chosen — the OS preference.
 */
export default function Home() {
  const theme = usePreviewStore((s) => s.theme);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const apply = (resolved) => {
      const root = document.documentElement;
      if (resolved === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    };

    // Explicit choice wins and disengages the OS listener.
    if (theme === "light" || theme === "dark") {
      apply(theme);
      return;
    }

    // No explicit choice → follow the OS and keep following it while it
    // changes (useful for people who toggle their system theme at sunset).
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    apply(mq.matches ? "dark" : "light");
    const handler = (e) => apply(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="brand-bar" aria-hidden />
      <Controls />
      <div className="nice-scroll flex-1 overflow-x-auto">
        <PreviewGrid />
      </div>
      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer
      className="border-t px-5 py-2.5 text-[11px]"
      style={{
        borderColor: "var(--border)",
        color: "var(--text-dim)",
      }}
    >
      <div className="mx-auto flex max-w-[1800px] items-center justify-between">
        <span className="font-mono">Responsive Preview · v2</span>
        <div className="flex items-center gap-3">
          <span>
            <kbd className="kbd mr-1">/</kbd>URL
          </span>
          <span>
            <kbd className="kbd mr-1">1</kbd>
            <kbd className="kbd mr-1">2</kbd>
            <kbd className="kbd mr-1">3</kbd>Category
          </span>
          <span>
            <kbd className="kbd mr-1">R</kbd>Refresh
          </span>
          <span>
            <kbd className="kbd mr-1">O</kbd>Rotate
          </span>
          <span>
            <kbd className="kbd mr-1">[</kbd>
            <kbd className="kbd mr-1">]</kbd>Zoom
          </span>
          <span>
            <kbd className="kbd mr-1">D</kbd>Theme
          </span>
        </div>
      </div>
    </footer>
  );
}
