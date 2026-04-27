"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizeUrl, isValidUrl } from "./url";

/**
 * Global state for the preview tool.
 *
 * Category model (v2):
 *   `activeCategory` is a single value — "mobile" | "tablet" | "desktop".
 *   Only devices in that category are rendered. Default: "desktop".
 *
 * Persisted slices are limited to user preferences (category, zoom,
 * orientation, sync-scroll). We deliberately do NOT persist the URL — every
 * session should start blank so the tool opens fast.
 */
export const usePreviewStore = create(
  persist(
    (set, get) => ({
      /** Submitted URL (the one the iframes render). Empty => show hero. */
      url: "",
      /** Text currently in the input; independent of `url` until submitted. */
      draft: "",
      /** "mobile" | "tablet" | "desktop" — only one at a time. */
      activeCategory: "desktop",
      /** "portrait" | "landscape" */
      orientation: "portrait",
      /** 0.25 – 1. Applied via CSS `transform: scale()`. */
      zoom: 0.5,
      /** If true, scroll position is mirrored across iframes (best-effort). */
      syncScroll: false,
      /**
       * "light" | "dark" | null. `null` means "follow the OS" until the user
       * picks a side explicitly; after that, the choice is remembered.
       */
      theme: null,
      /** Bump to force all iframes to re-mount and refresh. */
      refreshNonce: 0,

      setDraft: (draft) => set({ draft }),

      submitUrl: (raw) => {
        const value = raw ?? get().draft;
        if (!isValidUrl(value)) return false;
        set({ url: normalizeUrl(value), draft: normalizeUrl(value) });
        return true;
      },

      clearUrl: () => set({ url: "", draft: "" }),

      setCategory: (activeCategory) => set({ activeCategory }),

      setOrientation: (orientation) => set({ orientation }),
      rotate: () =>
        set((s) => ({
          orientation: s.orientation === "portrait" ? "landscape" : "portrait",
        })),

      setZoom: (zoom) =>
        set({ zoom: Math.max(0.25, Math.min(1, Number(zoom) || 0.5)) }),

      setSyncScroll: (syncScroll) => set({ syncScroll }),
      toggleSyncScroll: () => set((s) => ({ syncScroll: !s.syncScroll })),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => {
          // Resolve an effective current theme, then flip it. If the user
          // hasn't chosen yet, read the OS preference so the first click
          // produces the *opposite* of what's currently on screen.
          const current =
            s.theme ??
            (typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light");
          return { theme: current === "dark" ? "light" : "dark" };
        }),

      refreshAll: () => set((s) => ({ refreshNonce: s.refreshNonce + 1 })),
    }),
    {
      name: "responsive-preview:v2",
      partialize: (s) => ({
        activeCategory: s.activeCategory,
        orientation: s.orientation,
        zoom: s.zoom,
        syncScroll: s.syncScroll,
        theme: s.theme,
      }),
    }
  )
);
