"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { usePreviewStore } from "@/lib/store";

/**
 * DeviceCard — single device preview (frame + label + iframe).
 *
 * Layout:
 *   <card>
 *     <header>                ← device name, resolution, open-in-new-tab
 *     <screen w=outerW h=outerH overflow-hidden>
 *       <stage w=innerW h=innerH transform:scale(zoom)>
 *         <iframe 100%/100% />
 *       </stage>
 *     </screen>
 *   </card>
 *
 * Scaling the stage (not the iframe) preserves the iframe's native
 * scrollbars. Exact aspect ratio of the logical device viewport is
 * always maintained.
 *
 * Graceful fallback: many sites send `X-Frame-Options: DENY` or a strict
 * CSP `frame-ancestors`. The browser silently refuses to render and no
 * onError fires — so we use an 8 s timeout to detect the block and swap
 * in a fallback card with a "Open in new tab" escape hatch.
 */
const DeviceCard = forwardRef(function DeviceCard(
  { device, url, onScroll, externalScrollRatio },
  ref
) {
  const orientation = usePreviewStore((s) => s.orientation);
  const zoom = usePreviewStore((s) => s.zoom);
  const refreshNonce = usePreviewStore((s) => s.refreshNonce);

  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [blocked, setBlocked] = useState(false);
  const [loadToken, setLoadToken] = useState(0);

  // Effective viewport (depends on orientation)
  const isLandscape = orientation === "landscape";
  const innerW = isLandscape ? device.height : device.width;
  const innerH = isLandscape ? device.width : device.height;

  // Reset load state when URL or refresh-nonce changes.
  useEffect(() => {
    if (!url) {
      setLoading(false);
      setBlocked(false);
      return;
    }
    setLoading(true);
    setBlocked(false);
    setLoadToken((t) => t + 1);
  }, [url, refreshNonce]);

  // Detect iframe blocks (X-Frame-Options / CSP) via timeout.
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setBlocked(true);
      setLoading(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [loading, loadToken]);

  // -- Scroll sync (best-effort; cross-origin blocks script access) -------
  const onScrollRef = useRef(onScroll);
  useEffect(() => {
    onScrollRef.current = onScroll;
  }, [onScroll]);

  useEffect(() => {
    if (!onScroll) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    let last = -1;
    const id = setInterval(() => {
      try {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;
        if (!doc || !win) return;
        const max =
          (doc.documentElement.scrollHeight || 0) -
          (win.innerHeight || innerH);
        const r = max > 0 ? (win.scrollY || 0) / max : 0;
        if (Math.abs(r - last) > 0.002) {
          last = r;
          onScrollRef.current?.(r);
        }
      } catch {
        // Cross-origin — nothing we can do.
      }
    }, 150);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadToken, innerH, Boolean(onScroll)]);

  // Apply incoming scroll ratio from a sibling frame.
  useEffect(() => {
    if (externalScrollRatio == null) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !win) return;
      const max =
        (doc.documentElement.scrollHeight || 0) -
        (win.innerHeight || innerH);
      win.scrollTo({
        top: Math.round(max * externalScrollRatio),
        behavior: "auto",
      });
    } catch {}
  }, [externalScrollRatio, loadToken, innerH]);

  const outerW = innerW * zoom;
  const outerH = innerH * zoom;

  return (
    <div
      ref={ref}
      className="animate-fade-in flex flex-col"
      style={{ width: outerW }}
    >
      {/* Header */}
      <div
        className="mb-2 flex items-center justify-between gap-2 rounded-md px-2 py-1.5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <CategoryDot category={device.category} />
          <span
            className="truncate text-[12.5px] font-semibold"
            style={{ color: "var(--text)" }}
          >
            {device.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {innerW} × {innerH}
          </span>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded p-0.5 transition focus-ring"
              style={{ color: "var(--text-dim)" }}
              title="Open in new tab"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="8 7 17 7 17 16" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Screen frame */}
      <div
        className="relative overflow-hidden rounded-md shadow-card"
        style={{
          width: outerW,
          height: outerH,
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {!url && <EmptyScreen />}

        {url && (
          <div
            style={{
              width: innerW,
              height: innerH,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            <iframe
              ref={iframeRef}
              key={loadToken}
              src={url}
              title={`${device.name} preview`}
              onLoad={() => {
                setLoading(false);
                setBlocked(false);
              }}
              onError={() => {
                setLoading(false);
                setBlocked(true);
              }}
              style={{
                width: "100%",
                height: "100%",
                border: 0,
                display: "block",
                background: "#fff",
              }}
              sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"
              referrerPolicy="no-referrer-when-downgrade"
              loading="lazy"
            />
          </div>
        )}

        {url && loading && !blocked && <LoadingOverlay />}

        {url && blocked && (
          <BlockedFallback
            url={url}
            onRetry={() => {
              setBlocked(false);
              setLoading(true);
              setLoadToken((t) => t + 1);
            }}
          />
        )}
      </div>
    </div>
  );
});

function CategoryDot({ category }) {
  const iconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-3.5 w-3.5",
    style: { color: "var(--text-muted)" },
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

function EmptyScreen() {
  return (
    <div
      className="flex h-full w-full items-center justify-center text-center"
      style={{ color: "var(--text-dim)" }}
    >
      <span className="text-[11px]">—</span>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ background: "color-mix(in oklab, var(--surface) 72%, transparent)" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="h-5 w-5 animate-spin"
        style={{ color: "var(--text-muted)" }}
      >
        <path d="M21 12a9 9 0 1 1-6.2-8.5" />
      </svg>
    </div>
  );
}

function BlockedFallback({ url, onRetry }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
      style={{ background: "var(--surface)" }}
    >
      <div
        className="mb-2 flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          background: "color-mix(in oklab, #f59e0b 18%, transparent)",
          color: "#b45309",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="13" />
          <line x1="12" y1="16" x2="12" y2="16.01" />
        </svg>
      </div>
      <p className="text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>
        Embedding blocked
      </p>
      <p
        className="mt-1 max-w-[230px] text-[11px] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        The site refuses iframe embedding via{" "}
        <span className="font-mono">X-Frame-Options</span> or CSP.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onRetry}
          className="btn focus-ring"
          style={{ height: 28, padding: "0 10px", fontSize: 11 }}
        >
          Retry
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary focus-ring"
          style={{ height: 28, padding: "0 10px", fontSize: 11 }}
        >
          Open in new tab
        </a>
      </div>
    </div>
  );
}

export default DeviceCard;
