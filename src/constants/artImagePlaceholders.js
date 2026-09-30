/**
 * Static grey placeholders under `public/images/` for failed or missing event art.
 * Use with <img onError={...}> so broken CDN/API URLs never flash broken icons.
 */
const base = process.env.PUBLIC_URL || "";

export const ART_PLACEHOLDER_THUMBNAIL = `${base}/images/art-placeholder-thumbnail.svg`;
export const ART_PLACEHOLDER_BANNER = `${base}/images/art-placeholder-banner.svg`;

export function applyArtImageFallback(event, fallbackSrc) {
  if (event?.target) {
    event.target.onerror = null;
    event.target.src = fallbackSrc;
  }
}
