/**
 * Normalize a user-entered URL: trim whitespace and prepend `https://`
 * when no scheme is present. Does NOT validate — pair with `isValidUrl`.
 */
export function normalizeUrl(raw) {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "https://" + trimmed;
}

/**
 * Returns true if the normalized URL parses and has a plausible hostname
 * (contains a dot, or is `localhost`). Keeps the bar lenient — we're a
 * preview tool, not a strict validator.
 */
export function isValidUrl(raw) {
  try {
    const u = new URL(normalizeUrl(raw));
    return u.hostname.includes(".") || u.hostname === "localhost";
  } catch {
    return false;
  }
}
