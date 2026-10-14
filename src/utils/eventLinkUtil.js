export const PUBLIC_EVENT_BASE_URL = 'https://www.prizmatix.nz/events';

/** Public customer-facing URL for an event (slug preferred, id fallback). */
export const getPublicEventUrl = (event = {}) => {
  const publicPath = event.slug || event.id;
  if (!publicPath) return null;
  return `${PUBLIC_EVENT_BASE_URL}/${publicPath}`;
};

export const copyPublicEventLink = async (event = {}) => {
  const url = getPublicEventUrl(event);
  if (!url) return false;
  await navigator.clipboard.writeText(url);
  return true;
};
