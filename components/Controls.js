"use client";

import { useEffect, useMemo } from "react";
import { usePreviewStore } from "@/lib/store";
import { DEVICES, CATEGORIES, devicesInCategory } from "@/lib/devices";

/**
 * Controls bar — category selector, orientation, zoom, sync-scroll.
 *
 * Device model (v2):
 *   Only ONE category (Mobile | Tablet | Desktop) is visible at a time. The
 *   segmented `CategoryTabs` is the single switch — picking a tab instantly
 *   replaces the preview grid with every device in that category. We never
 *   mix categories in the same view.
 *
 * Grouped left-to-right in order of use frequency:
 *  1. Category tabs (the primary switch)
 *  2. Orientation (portrait / landscape)
 *  3. Zoom slider
 *  4. Sync-scroll (opt-in)
 */
export default function Controls() {
  const activeCategory = usePreviewStore((s) => s.activeCategory);
  const setCategory = usePreviewStore((s) => s.setCategory);
  const orientation = usePreviewStore((s) => s.orientation);
  const setOrientation = usePreviewStore((s) => s.setOrientation);
  const rotate = usePreviewStore((s) => s.rotate);
  const zoom = usePreviewStore((s) => s.zoom);
  const setZoom = usePreviewStore((s) => s.setZoom);
  const syncScroll = usePreviewStore((s) => s.syncScroll);
  const toggleSyncScroll = usePreviewStore((s) => s.toggleSyncScroll);
  const refreshAll = usePreviewStore((s) => s.refreshAll);
  const toggleTheme = usePreviewStore((s) => s.toggleTheme);

  // Keyboard shortcuts, active anywhere outside text inputs.
  // 1/2/3 quickly switch categories — matches the visual order of the tabs.
  useEffect(() => {
    function onKey(e) {
      const ae = document.activeElement;
      const editable =
        ae?.tagName === "INPUT" ||
        ae?.tagName === "TEXTAREA" ||
        ae?.isContentEditable;
      if (editable) return;
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        refreshAll();
      } else if (e.key === "o" || e.key === "O") {
        e.preventDefault();
        rotate();
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === "[") {
        e.preventDefault();
        setZoom(Math.max(0.25, Math.round((zoom - 0.05) * 100) / 100));
      } else if (e.key === "]") {
        e.preventDefault();
        setZoom(Math.min(1, Math.round((zoom + 0.05) * 100) / 100));
      } else if (e.key === "1") {
        e.preventDefault();
        setCategory("mobile");
      } else if (e.key === "2") {
        e.preventDefault();
        setCategory("tablet");
      } else if (e.key === "3") {
        e.preventDefault();
        setCategory("desktop");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rotate, refreshAll, setZoom, zoom, setCategory, toggleTheme]);

  return (
    <div
      className="sticky top-[65px] z-20"
      style={{
        background: "color-mix(in oklab, var(--bg) 88%, transparent)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
        <CategoryTabs
          activeCategory={activeCategory}
          setCategory={setCategory}
        />

        <Divider />

        <OrientationToggle
          orientation={orientation}
          setOrientation={setOrientation}
        />

        <Divider />

        <ZoomControl zoom={zoom} setZoom={setZoom} />

        <div className="ml-auto flex items-center gap-4">
          <SyncScrollToggle
            syncScroll={syncScroll}
            onToggle={toggleSyncScroll}
          />
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="hidden h-5 w-px md:block"
      style={{ background: "var(--border)" }}
    />
  );
}

/* ========== Category tabs =========================================
 * Segmented control with three exclusive options. The active tab fills
 * with brand navy; its category's JaiVeeru accent (red / yellow / green)
 * shows as a thin colored bar along the top, so the palette reads without
 * overwhelming the navy-on-white hierarchy.
 * ================================================================ */
function CategoryTabs({ activeCategory, setCategory }) {
  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.map((c) => [c.id, devicesInCategory(c.id).length])
      ),
    []
  );

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="label-xs">Category</span>
      <div
        role="tablist"
        aria-label="Device category"
        className="inline-flex overflow-hidden rounded-md border"
        style={{ borderColor: "var(--border)" }}
      >
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(cat.id)}
              className="relative inline-flex items-center gap-2 px-3.5 py-1.5 text-[12.5px] font-medium transition focus-ring"
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "var(--accent-ink)" : "var(--text-muted)",
                borderLeft:
                  cat.id === "mobile" ? "none" : "1px solid var(--border)",
              }}
              title={`${cat.label} — ${counts[cat.id]} size${
                counts[cat.id] === 1 ? "" : "s"
              }`}
            >
              <span
                aria-hidden
                className="absolute left-0 right-0 top-0 h-[2px]"
                style={{
                  background: cat.accent,
                  opacity: active ? 1 : 0.45,
                }}
              />
              <CategoryIcon
                category={cat.id}
                color={active ? "var(--accent-ink)" : "var(--text-dim)"}
              />
              <span>{cat.label}</span>
              <span
                className="font-mono text-[10.5px] tabular-nums"
                style={{
                  color: active
                    ? "color-mix(in oklab, var(--accent-ink) 75%, transparent)"
                    : "var(--text-dim)",
                }}
              >
                {counts[cat.id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryIcon({ category, color = "var(--text-dim)" }) {
  const iconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-3.5 w-3.5",
    style: { color },
  };
  if (category === "mobile")
    return (
      <svg {...iconProps}>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
    );
  if (category === "tablet")
    return (
      <svg {...iconProps}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
    );
  return (
    <svg {...iconProps}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

/* ========== Orientation toggle ========== */
function OrientationToggle({ orientation, setOrientation }) {
  return (
    <div className="flex items-center gap-2">
      <span className="label-xs">Orientation</span>
      <div
        className="inline-flex overflow-hidden rounded-md border"
        style={{ borderColor: "var(--border)" }}
      >
        {[
          { id: "portrait", label: "Portrait" },
          { id: "landscape", label: "Landscape" },
        ].map((o) => (
          <button
            key={o.id}
            onClick={() => setOrientation(o.id)}
            className="px-2.5 py-1.5 text-[12px] font-medium transition focus-ring"
            style={{
              background:
                orientation === o.id ? "var(--accent)" : "transparent",
              color:
                orientation === o.id
                  ? "var(--accent-ink)"
                  : "var(--text-muted)",
            }}
            aria-pressed={orientation === o.id}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ========== Zoom ========== */
function ZoomControl({ zoom, setZoom }) {
  return (
    <div className="flex items-center gap-2">
      <span className="label-xs">Zoom</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            setZoom(Math.max(0.25, Math.round((zoom - 0.05) * 100) / 100))
          }
          className="btn btn-ghost focus-ring"
          style={{ padding: "0 8px", height: 28 }}
          aria-label="Zoom out"
          title="Zoom out ( [ )"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <input
          type="range"
          min="0.25"
          max="1"
          step="0.05"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="slider w-[120px]"
          aria-label="Zoom level"
        />
        <button
          onClick={() =>
            setZoom(Math.min(1, Math.round((zoom + 0.05) * 100) / 100))
          }
          className="btn btn-ghost focus-ring"
          style={{ padding: "0 8px", height: 28 }}
          aria-label="Zoom in"
          title="Zoom in ( ] )"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(0.5)}
          className="font-mono text-[11px] tabular-nums transition hover:opacity-80"
          style={{ color: "var(--text-muted)", minWidth: 36 }}
          title="Reset to 50%"
        >
          {Math.round(zoom * 100)}%
        </button>
      </div>
    </div>
  );
}

/* ========== Sync-scroll ========== */
function SyncScrollToggle({ syncScroll, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[12px] transition focus-ring"
      style={{ color: "var(--text-muted)" }}
      aria-pressed={syncScroll}
      title="Mirror scroll position across previews (best-effort; same-origin only)"
    >
      <span
        className="relative inline-block h-4 w-7 rounded-full transition"
        style={{
          background: syncScroll ? "var(--accent)" : "var(--border-strong)",
        }}
      >
        <span
          className="absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition"
          style={{ left: syncScroll ? 14 : 2 }}
        />
      </span>
      Sync scroll
    </button>
  );
}
