"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePreviewStore } from "@/lib/store";
import { DEVICES, CATEGORIES, devicesInCategory } from "@/lib/devices";
import DeviceCard from "./DeviceCard";

/**
 * PreviewGrid — lays out every device in the active category.
 *
 * Category-exclusive rule (v2):
 *   Exactly one category is shown at a time. Switching the selector in
 *   Controls replaces the entire grid instantly — we never mix Mobile,
 *   Tablet, and Desktop in the same view.
 *
 * Layout:
 *  - 1 device   → centered
 *  - 2+ devices → flex-wrap, top-aligned, generous gap. The gap narrows
 *    slightly on Desktop so two 1440-px frames can sit side-by-side at
 *    the default 50 % zoom.
 *
 * Scroll-sync leadership: the first device to scroll takes over for a
 * short window so siblings can follow its ratio without tug-of-war.
 * Leadership releases after 300 ms of idle so any device can take over
 * next.
 */
export default function PreviewGrid() {
  const url = usePreviewStore((s) => s.url);
  const activeCategory = usePreviewStore((s) => s.activeCategory);
  const syncScroll = usePreviewStore((s) => s.syncScroll);

  const [ratio, setRatio] = useState(null);
  const leaderRef = useRef(null);
  const timerRef = useRef(null);

  const onScroll = useCallback(
    (id, r) => {
      if (!syncScroll) return;
      if (leaderRef.current && leaderRef.current !== id) return;
      leaderRef.current = id;
      setRatio(r);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        leaderRef.current = null;
      }, 300);
    },
    [syncScroll]
  );

  const devices = useMemo(
    () => devicesInCategory(activeCategory),
    [activeCategory]
  );

  if (!url) {
    return <HeroEmpty />;
  }

  // Desktop frames are physically wider, so tighten the gap to keep the
  // grid from wrapping too eagerly at typical viewport widths.
  const gap = activeCategory === "desktop" ? "gap-8" : "gap-10";

  return (
    <div className="mx-auto max-w-[1800px] px-5 py-8">
      <CategoryHeader
        activeCategory={activeCategory}
        deviceCount={devices.length}
      />
      <div className={`flex flex-wrap items-start justify-start ${gap}`}>
        {devices.map((d) => (
          <DeviceCard
            key={d.id}
            device={d}
            url={url}
            onScroll={syncScroll ? (r) => onScroll(d.id, r) : undefined}
            externalScrollRatio={
              syncScroll && leaderRef.current && leaderRef.current !== d.id
                ? ratio
                : null
            }
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Small heading above the grid that names what's on screen. Keeps the
 * category switch visible as a scroll-persistent signal ("yes, you're
 * looking at Desktop") without needing to jump back to the tabs.
 */
function CategoryHeader({ activeCategory, deviceCount }) {
  const cat = CATEGORIES.find((c) => c.id === activeCategory);
  if (!cat) return null;
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: cat.accent }}
        aria-hidden
      />
      <h2
        className="text-[13px] font-semibold tracking-tight"
        style={{ color: "var(--text)" }}
      >
        {cat.label}
      </h2>
      <span
        className="font-mono text-[11px] tabular-nums"
        style={{ color: "var(--text-dim)" }}
      >
        {deviceCount} size{deviceCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function HeroEmpty() {
  const activeCategory = usePreviewStore((s) => s.activeCategory);
  const orientation = usePreviewStore((s) => s.orientation);

  const devices = devicesInCategory(activeCategory);
  const cat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="mx-auto max-w-[1800px] px-5 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1
          className="mb-3 text-[30px] font-semibold leading-tight tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Enter a URL to preview across devices.
        </h1>
        <p
          className="mx-auto mb-12 max-w-md text-[14px] leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Live iframes at the exact viewport sizes — paste any URL in the bar
          above to begin.
        </p>

        <GhostStrip
          devices={devices}
          category={cat}
          orientation={orientation}
        />
      </div>
    </div>
  );
}

/**
 * Proportional ghost-frame strip — a visual preview of the viewports the
 * active category will render. Each placeholder scales to its true aspect
 * ratio so designers can intuit the set at a glance, and the category's
 * brand accent shows as a thin top rule.
 */
function GhostStrip({ devices, category, orientation }) {
  // Cap all ghosts to the same bounding box; tallest shape reaches the box
  // edge, others shrink to match their aspect ratio.
  const BOX_W = 160;
  const BOX_H = 112;

  return (
    <div
      className="flex items-end justify-center gap-5 border-t pt-8"
      style={{ borderColor: "var(--border)" }}
    >
      {devices.map((d) => {
        const w = orientation === "landscape" ? d.height : d.width;
        const h = orientation === "landscape" ? d.width : d.height;
        const scale = Math.min(BOX_W / w, BOX_H / h);
        const gw = Math.round(w * scale);
        const gh = Math.round(h * scale);
        return (
          <div
            key={d.id}
            className="flex flex-col items-center gap-2"
            style={{ width: BOX_W }}
          >
            <div
              className="flex items-end justify-center"
              style={{ height: BOX_H }}
            >
              <div
                className="dashed relative overflow-hidden"
                style={{
                  width: gw,
                  height: gh,
                  borderRadius: 4,
                  border: "1px solid var(--border-strong)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute left-0 right-0 top-0"
                  style={{ height: 2, background: category?.accent }}
                />
              </div>
            </div>
            <div className="leading-tight">
              <div
                className="text-[12px] font-semibold"
                style={{ color: "var(--text)" }}
              >
                {d.name}
              </div>
              <div
                className="font-mono text-[10.5px] tabular-nums"
                style={{ color: "var(--text-dim)" }}
              >
                {w}×{h}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
