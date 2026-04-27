# Responsive Preview

A practical multi-device preview tool for developers and designers. Enter any
URL and view it live across every size in a single device category — in real
iframes, not screenshots.

## Stack

- **Next.js 14** (App Router, JavaScript)
- **React 18** with hooks
- **Tailwind CSS 3** for styling
- **Zustand** for cross-component state with local persistence

## Feature overview

| Area            | Behavior                                                                    |
| --------------- | --------------------------------------------------------------------------- |
| URL input       | Auto-prepends `https://`; validates hostname; `/` focuses the field         |
| Category tabs   | Exclusive switch between Mobile, Tablet, Desktop — Desktop by default       |
| Viewports       | Exact aspect ratios, clearly labeled, updated on every render               |
| Orientation     | Portrait / landscape toggle — applies to every device in the category       |
| Zoom            | 25 %–100 % via CSS `transform: scale()` on a wrapper (iframe keeps scrolls) |
| Sync scroll     | Optional; best-effort (same-origin only — cross-origin is a browser limit)  |
| Refresh         | One button re-keys every iframe; also bound to `R`                          |
| Fallback        | Graceful card when a site blocks iframe embedding                           |
| Persistence     | User prefs (category, zoom, orientation, sync, theme) saved to `localStorage` |
| Theme           | Light + dark, follows the OS by default — `D` toggles explicitly           |
| Loading state   | Spinner overlay per iframe until load fires (or the embed-blocked fallback) |
| Keyboard        | `/` URL · `1`/`2`/`3` category · `R` refresh · `O` rotate · `[` `]` zoom · `D` theme |

## Category-exclusive display

The grid shows **one category at a time.** Switching tabs instantly replaces
the grid — the tool never mixes Mobile, Tablet, and Desktop in the same view.
Every size belonging to the selected category is rendered; the layout wraps
to fit the available width and scrolls horizontally if needed.

| Category | Devices rendered when selected                                  |
| -------- | --------------------------------------------------------------- |
| Mobile   | Mobile S (360×640) · Mobile M (375×812) · Mobile L (414×896)    |
| Tablet   | Tablet (768×1024) · Tablet L (1024×768)                         |
| Desktop  | Desktop S (1366×768) · Desktop (1440×900) · Desktop L (1920×1080) |

**Default on first load:** Desktop.

## Device presets

| Category | Name       | Resolution  |
| -------- | ---------- | ----------- |
| Mobile   | Mobile S   | 360 × 640   |
| Mobile   | Mobile M   | 375 × 812   |
| Mobile   | Mobile L   | 414 × 896   |
| Tablet   | Tablet     | 768 × 1024  |
| Tablet   | Tablet L   | 1024 × 768  |
| Desktop  | Desktop S  | 1366 × 768  |
| Desktop  | Desktop    | 1440 × 900  |
| Desktop  | Desktop L  | 1920 × 1080 |

## Brand palette (JaiVeeru Creative Marketing Agency)

| Token               | Hex       | Usage                                          |
| ------------------- | --------- | ---------------------------------------------- |
| `--accent`          | `#1e2875` | Primary interaction navy (buttons, focus ring) |
| `--accent-hover`    | `#171e5a` | Hover state for primary actions                |
| `--brand-red`       | `#e63946` | Mobile category accent                         |
| `--brand-yellow`    | `#f5c518` | Tablet category accent                         |
| `--brand-green`     | `#3db04c` | Desktop category accent                        |

A two-pixel tricolor bar under the top navigation echoes the JaiVeeru logo
flourish. Category tabs carry their accent as a top-edge highlight so the
palette reads even on inactive tabs.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## File structure

```
responsive-preview/
├── app/
│   ├── layout.js          # Root layout + fonts
│   ├── page.js            # Composition: <Header> <Controls> <PreviewGrid>
│   └── globals.css        # Tailwind + design tokens + component utilities
├── components/
│   ├── Header.js          # Logo, URL input, primary actions
│   ├── Controls.js        # Category tabs, orientation, zoom, sync-scroll
│   ├── PreviewGrid.js     # Category-filtered grid + scroll-sync broker
│   └── DeviceCard.js      # Single preview (frame + label + iframe + fallback)
├── lib/
│   ├── devices.js         # Device catalog + category helpers
│   ├── url.js             # normalizeUrl / isValidUrl
│   └── store.js           # Zustand store with persisted preferences
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
└── README.md
```

## Design notes

- **Layout priority** — the preview grid gets the whole content area;
  controls sit in a sticky top bar so they are always one click away but
  never dominant.
- **Category tabs** — a single segmented control is the primary switch. The
  active tab fills with brand navy; each tab carries a top-edge accent in
  its JaiVeeru category color (red / yellow / green).
- **Device cards** — flat, neutral rectangles with a small header for name,
  resolution, and an open-in-new-tab escape hatch. No decorative bezels or
  imitation hardware; the goal is accurate viewport rendering.
- **Spacing** — generous `gap-10` between mobile/tablet cards; desktop uses
  `gap-8` so two 1440-px frames sit side-by-side at 50 % zoom.
- **Colors** — JaiVeeru navy as the interaction accent, neutral warm-white
  chrome so the preview content isn't tinted. Tokens live in
  `app/globals.css` so retheming is a one-file edit.
- **Accessibility** — visible focus ring on every interactive element,
  `aria-selected` on category tabs, `aria-pressed` on toggles, respects
  `prefers-reduced-motion`.

## Known limitations (honest)

- **X-Frame-Options / CSP.** Many sites (Google, most banks, some SaaS auth
  pages) refuse iframe embedding. There is no client-side workaround — the
  browser refuses. The fallback card gives an "open in new tab" out.
- **Cross-origin scroll sync.** Syncing iframe scroll requires same-origin
  access. It works transparently on `localhost`-to-`localhost` dev servers;
  it is silently skipped for public sites. This is a browser security
  guarantee, not a bug here.
- **Mobile user agents.** Iframes render with the host browser's UA string.
  Sites that branch on UA sniffing (rather than viewport width) may show
  their desktop tree. Use your browser's device-emulation devtools for
  UA-sensitive testing.
