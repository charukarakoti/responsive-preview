"use client";

import { useEffect, useRef, useState } from "react";
import { usePreviewStore } from "@/lib/store";
import { isValidUrl, normalizeUrl } from "@/lib/url";

/**
 * Header — logo + URL input + primary actions.
 *
 * The URL bar is the only truly required control in the app, so we give it
 * visual priority and bind `/` as a focus shortcut (a convention users of
 * dev tools tend to expect).
 */
export default function Header() {
  const draft = usePreviewStore((s) => s.draft);
  const url = usePreviewStore((s) => s.url);
  const setDraft = usePreviewStore((s) => s.setDraft);
  const submitUrl = usePreviewStore((s) => s.submitUrl);
  const refreshAll = usePreviewStore((s) => s.refreshAll);
  const clearUrl = usePreviewStore((s) => s.clearUrl);
  const theme = usePreviewStore((s) => s.theme);
  const toggleTheme = usePreviewStore((s) => s.toggleTheme);

  const inputRef = useRef(null);
  const valid = !draft || isValidUrl(draft);

  // "/" focuses the URL input — unless the user is already typing.
  useEffect(() => {
    function onKey(e) {
      const ae = document.activeElement;
      const editable =
        ae?.tagName === "INPUT" ||
        ae?.tagName === "TEXTAREA" ||
        ae?.isContentEditable;
      if (editable) return;
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!draft || !valid) return;
    submitUrl(draft);
  }

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-sm"
      style={{
        background: "color-mix(in oklab, var(--bg) 82%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto flex max-w-[1800px] items-center gap-4 px-5 py-3">
        <Logo />

        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative flex-1">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-dim)" }}
              aria-hidden="true"
            >
              <Icon name="globe" className="h-4 w-4" />
            </span>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Enter any URL — e.g. https://example.com"
              className="input pl-9 pr-24 focus-ring"
              style={{
                borderColor: !valid ? "var(--danger)" : undefined,
              }}
              spellCheck={false}
              autoComplete="off"
            />
            {draft && (
              <button
                type="button"
                onClick={() => {
                  setDraft("");
                  inputRef.current?.focus();
                }}
                className="absolute right-[86px] top-1/2 -translate-y-1/2 rounded p-1 focus-ring"
                style={{ color: "var(--text-dim)" }}
                aria-label="Clear URL"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <span className="kbd">/</span>
            </kbd>
          </div>

          <button
            type="submit"
            disabled={!draft || !valid}
            className="btn btn-primary focus-ring disabled:opacity-40"
          >
            <Icon name="play" className="h-3.5 w-3.5" />
            Preview
          </button>
        </form>

        <div className="flex items-center gap-1">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button
            onClick={refreshAll}
            className="btn btn-ghost focus-ring"
            title="Refresh all previews (R)"
            disabled={!url}
          >
            <Icon name="refresh" className="h-4 w-4" />
            <span className="hidden md:inline">Refresh</span>
          </button>
          {url && (
            <button
              onClick={clearUrl}
              className="btn btn-ghost focus-ring"
              title="Clear current URL"
            >
              <Icon name="x" className="h-4 w-4" />
              <span className="hidden md:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {draft && !valid && (
        <div
          className="border-t px-5 py-1.5 text-[12px]"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-alt)",
            color: "var(--danger)",
          }}
        >
          That doesn't look like a valid URL. Try something like{" "}
          <span className="font-mono">example.com</span>.
        </div>
      )}
    </header>
  );
}

/**
 * Resolve what's actually on screen right now. If the user hasn't picked a
 * theme, we infer from the OS so the icon shows the *next* state (a sun
 * when you're in dark mode, a moon when you're in light mode).
 */
function resolveTheme(theme) {
  if (theme === "dark" || theme === "light") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function ThemeToggle({ theme, onToggle }) {
  // Track the resolved theme in local state so the icon stays in sync when
  // the OS changes (and the store hasn't been told yet).
  const [resolved, setResolved] = useState(() => resolveTheme(theme));

  useEffect(() => {
    setResolved(resolveTheme(theme));
    if (theme === "dark" || theme === "light") return;
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setResolved(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const isDark = resolved === "dark";
  const nextLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      onClick={onToggle}
      className="btn btn-ghost focus-ring"
      title={`${nextLabel} (D)`}
      aria-label={nextLabel}
      aria-pressed={isDark}
    >
      <Icon name={isDark ? "sun" : "moon"} className="h-4 w-4" />
    </button>
  );
}

function Logo() {
  return (
    <div className="hidden shrink-0 items-center gap-2 sm:flex">
      <div
        className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
      >
        <Icon name="layers" className="h-4 w-4" />
        {/* Tricolor ribbon — JaiVeeru brand flourish */}
        <span
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, var(--brand-red) 0 33%, var(--brand-yellow) 33% 66%, var(--brand-green) 66% 100%)",
          }}
          aria-hidden
        />
      </div>
      <div className="hidden md:block">
        <div className="text-[13px] font-semibold leading-tight">
          Responsive Preview
        </div>
        <div
          className="font-mono text-[10px] leading-tight"
          style={{ color: "var(--text-dim)" }}
        >
          multi-device · live
        </div>
      </div>
    </div>
  );
}

function Icon({ name, className = "h-4 w-4" }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    className,
  };
  switch (name) {
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" {...p} />
          <path d="M3 12h18" {...p} />
          <path d="M12 3a14 14 0 0 1 0 18" {...p} />
          <path d="M12 3a14 14 0 0 0 0 18" {...p} />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" {...p} />
          <path d="M21 3v5h-5" {...p} />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <line x1="6" y1="6" x2="18" y2="18" {...p} />
          <line x1="18" y1="6" x2="6" y2="18" {...p} />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="M12 3 3 8l9 5 9-5-9-5z" {...p} />
          <path d="M3 16l9 5 9-5" {...p} />
          <path d="M3 12l9 5 9-5" {...p} />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" {...p} />
          <path d="M12 2v2" {...p} />
          <path d="M12 20v2" {...p} />
          <path d="M4.93 4.93l1.41 1.41" {...p} />
          <path d="M17.66 17.66l1.41 1.41" {...p} />
          <path d="M2 12h2" {...p} />
          <path d="M20 12h2" {...p} />
          <path d="M4.93 19.07l1.41-1.41" {...p} />
          <path d="M17.66 6.34l1.41-1.41" {...p} />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" {...p} />
        </svg>
      );
    default:
      return null;
  }
}
