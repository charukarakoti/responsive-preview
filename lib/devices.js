/**
 * Fixed, realistic device screen sizes (in CSS pixels / logical resolution).
 *
 * Defaults (per spec) = `default: true`:
 *   Mobile:  375 × 812 (iPhone 12+)
 *   Tablet:  768 × 1024 (iPad)
 *   Desktop: 1440 × 900 (Common laptop)
 */
export const DEVICES = [
  // MOBILE — Common mobile sizes and popular devices
  {
    id: "mobile-360",
    name: "Mobile S (Galaxy S21)",
    category: "mobile",
    width: 360,
    height: 800,
    default: false,
  },
  {
    id: "mobile-375",
    name: "Mobile M (iPhone 12+)",
    category: "mobile",
    width: 375,
    height: 812,
    default: true,
  },
  {
    id: "mobile-390",
    name: "Mobile (Pixel 6)",
    category: "mobile",
    width: 390,
    height: 844,
    default: false,
  },
  {
    id: "mobile-414",
    name: "Mobile L (iPhone 11 Pro Max)",
    category: "mobile",
    width: 414,
    height: 896,
    default: false,
  },
  
  // TABLET — iPad and Android tablet sizes
  {
    id: "tablet-768",
    name: "iPad Mini (portrait)",
    category: "tablet",
    width: 768,
    height: 1024,
    default: true,
  },
  {
    id: "tablet-820",
    name: "iPad Air (portrait)",
    category: "tablet",
    width: 820,
    height: 1180,
    default: false,
  },
  {
    id: "tablet-1024-port",
    name: "iPad Pro 11\" (portrait)",
    category: "tablet",
    width: 1024,
    height: 1366,
    default: false,
  },
  {
    id: "tablet-768-land",
    name: "iPad Mini (landscape)",
    category: "tablet",
    width: 1024,
    height: 768,
    default: false,
  },
  {
    id: "tablet-820-land",
    name: "iPad Air (landscape)",
    category: "tablet",
    width: 1180,
    height: 820,
    default: false,
  },
  {
    id: "tablet-1024-land",
    name: "iPad Pro 11\" (landscape)",
    category: "tablet",
    width: 1366,
    height: 1024,
    default: false,
  },
  
  // DESKTOP — Common desktop and laptop sizes
  {
    id: "desktop-1024",
    name: "Small Laptop",
    category: "desktop",
    width: 1024,
    height: 768,
    default: false,
  },
  {
    id: "desktop-1366",
    name: "Laptop HD",
    category: "desktop",
    width: 1366,
    height: 768,
    default: false,
  },
  {
    id: "desktop-1440",
    name: "Desktop (1440p)",
    category: "desktop",
    width: 1440,
    height: 900,
    default: true,
  },
  {
    id: "desktop-1536",
    name: "Laptop 2K",
    category: "desktop",
    width: 1536,
    height: 864,
    default: false,
  },
  {
    id: "desktop-1920",
    name: "Desktop Full HD",
    category: "desktop",
    width: 1920,
    height: 1080,
    default: false,
  },
  {
    id: "desktop-2560",
    name: "Desktop 2K",
    category: "desktop",
    width: 2560,
    height: 1440,
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
