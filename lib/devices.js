/**
 * Fixed, realistic device screen sizes (in CSS pixels / logical resolution).
 *
 * Defaults (per spec) = `default: true`:
 *   Mobile:  375 × 812
 *   Tablet:  768 × 1024
 *   Desktop: 1440 × 900
 */
export const DEVICES = [
  {
    id: "mobile-360",
    name: "Mobile S",
    category: "mobile",
    width: 360,
    height: 640,
    default: false,
  },
  {
    id: "mobile-375",
    name: "Mobile M",
    category: "mobile",
    width: 375,
    height: 812,
    default: true,
  },
  {
    id: "mobile-414",
    name: "Mobile L",
    category: "mobile",
    width: 414,
    height: 896,
    default: false,
  },
  {
    id: "tablet-768",
    name: "Tablet",
    category: "tablet",
    width: 768,
    height: 1024,
    default: true,
  },
  {
    id: "tablet-1024",
    name: "Tablet L",
    category: "tablet",
    width: 1024,
    height: 768,
    default: false,
  },
  {
    id: "desktop-1366",
    name: "Desktop S",
    category: "desktop",
    width: 1366,
    height: 768,
    default: false,
  },
  {
    id: "desktop-1440",
    name: "Desktop",
    category: "desktop",
    width: 1440,
    height: 900,
    default: true,
  },
  {
    id: "desktop-1920",
    name: "Desktop L",
    category: "desktop",
    width: 1920,
    height: 1080,
    default: false,
  },
];

export const DEVICE_BY_ID = Object.fromEntries(DEVICES.map((d) => [d.id, d]));

/**
 * Ordered list used by the category selector. Each category carries a brand
 * accent pulled from the JaiVeeru logo palette — used as a small tint on the
 * category's tab to help users distinguish them at a glance.
 */
export const CATEGORIES = [
  { id: "mobile", label: "Mobile", accent: "var(--brand-red)" },
  { id: "tablet", label: "Tablet", accent: "var(--brand-yellow)" },
  { id: "desktop", label: "Desktop", accent: "var(--brand-green)" },
];

export const DEFAULT_CATEGORY = "desktop";

export function devicesInCategory(category) {
  return DEVICES.filter((d) => d.category === category).sort(
    (a, b) => a.width - b.width
  );
}
