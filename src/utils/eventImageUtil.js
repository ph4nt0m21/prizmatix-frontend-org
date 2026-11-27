/** Returns a usable remote image URL, or null when only a local fallback applies. */
export function getEventImageHref(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return null;
}

/** Prefer the original API href; fall back to whatever is currently displayed. */
export function resolvePreviewSrc(original, display) {
  return (
    getEventImageHref(original) ??
    getEventImageHref(display) ??
    display ??
    original ??
    ''
  );
}
