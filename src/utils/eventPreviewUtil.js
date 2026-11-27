import { formatEventTimeForDisplay as formatEventTime } from './datetimeUtil';

export { formatEventTimeForDisplay, formatTime24, formatEventScheduleForDisplay, formatEventScheduleFromFormDateTime } from './datetimeUtil';

const TBA_VENUE = /^to be announced$/i;

export function normalizeLocationType(type, isToBeAnnounced) {
  if (isToBeAnnounced) return 'tba';
  const raw = (type ?? 'physical').trim().toLowerCase();
  if (raw === 'to_be_announced') return 'tba';
  return raw;
}

export function mapOrgLocationToPreviewFields(location = {}) {
  return {
    eventLocationName: location.venue,
    eventLocationType: normalizeLocationType(
      location.locationType,
      location.isToBeAnnounced
    ),
    eventLocationStreet: location.street,
    eventLocationStreetNumber: location.streetNumber,
    eventLocationCity: location.city,
    eventLocationPostalCode: location.postalCode,
    eventLocationState: location.state,
    eventLocationCountry: location.country,
    eventLocationAddress: location.formattedAddress,
    eventLocationGoogleMapLink: location.googleMapLink,
    eventLocationMeetingUrl: location.onlineEventUrl,
    eventLocationJoinNotes: location.onlineEventDescription,
    eventLocationAdditionalInfo: location.additionalInfo,
    eventLocationLatitude:
      location.latitude != null && location.latitude !== ''
        ? parseFloat(location.latitude)
        : null,
    eventLocationLongitude:
      location.longitude != null && location.longitude !== ''
        ? parseFloat(location.longitude)
        : null,
  };
}

function parseCoordsFromGoogleMapsUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return null;

  let match = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }

  match = trimmed.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }

  match = trimmed.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }

  return null;
}

function buildEmbedFromCoords(lat, lng, zoom = 15) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

function buildEmbedFromQuery(query, zoom = 15) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;
}

export function formatPhysicalAddressLines(location) {
  const lines = [];

  const streetLine = [location.eventLocationStreetNumber, location.eventLocationStreet]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (streetLine) lines.push(streetLine);

  const cityLine = [
    location.eventLocationCity,
    location.eventLocationState,
    location.eventLocationPostalCode,
  ]
    .filter(Boolean)
    .join(', ')
    .trim();
  if (cityLine) lines.push(cityLine);

  if (location.eventLocationCountry?.trim()) {
    lines.push(location.eventLocationCountry.trim());
  }

  if (lines.length === 0 && location.eventLocationAddress?.trim()) {
    lines.push(location.eventLocationAddress.trim());
  }

  return lines;
}

export function formatEventLocationSummary(locationFields) {
  const type = normalizeLocationType(locationFields.eventLocationType);

  if (type === 'tba') return 'Venue to be announced';
  if (type === 'private') return 'Private venue';
  if (type === 'online') return 'Online event';

  const venue = locationFields.eventLocationName?.trim();
  if (venue && !TBA_VENUE.test(venue)) return venue;

  const addressLines = formatPhysicalAddressLines(locationFields);
  if (addressLines.length > 0) return addressLines[0];

  return 'In-person event';
}

function buildMapSearchQuery(location) {
  const addressQuery = formatPhysicalAddressLines(location).join(', ');
  const venue = location.eventLocationName?.trim();
  const hasVenue = Boolean(venue && !TBA_VENUE.test(venue));

  if (hasVenue && addressQuery) return `${venue}, ${addressQuery}`;
  if (hasVenue) return venue;
  return addressQuery;
}

export function buildMapEmbedUrl(locationFields) {
  const type = normalizeLocationType(locationFields.eventLocationType);
  if (type === 'online' || type === 'tba' || type === 'private') {
    return null;
  }

  const searchQuery = buildMapSearchQuery(locationFields);
  if (searchQuery) return buildEmbedFromQuery(searchQuery);

  const { eventLocationLatitude: lat, eventLocationLongitude: lng } = locationFields;
  if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    return buildEmbedFromCoords(lat, lng);
  }

  const googleLink = locationFields.eventLocationGoogleMapLink?.trim();
  if (googleLink) {
    const coordsFromLink = parseCoordsFromGoogleMapsUrl(googleLink);
    if (coordsFromLink) {
      return buildEmbedFromCoords(coordsFromLink.lat, coordsFromLink.lng);
    }
    if (googleLink.includes('output=embed') && googleLink.includes('maps.google.com/maps')) {
      return googleLink;
    }
  }

  return null;
}

export function buildMapExternalUrl(locationFields) {
  if (normalizeLocationType(locationFields.eventLocationType) === 'private') {
    return null;
  }

  const searchQuery = buildMapSearchQuery(locationFields);
  if (searchQuery) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
  }

  const { eventLocationLatitude: lat, eventLocationLongitude: lng } = locationFields;
  if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  return locationFields.eventLocationGoogleMapLink?.trim() || null;
}

export function venueSectionTitle(locationType) {
  const type = normalizeLocationType(locationType);
  if (type === 'online') return 'Online event';
  if (type === 'tba' || type === 'private') return 'Location';
  return 'Venue';
}

export function displayVenueName(locationFields) {
  const type = normalizeLocationType(locationFields.eventLocationType);
  if (type === 'tba' || type === 'online' || type === 'private') return null;

  const venue = locationFields.eventLocationName?.trim();
  if (!venue || TBA_VENUE.test(venue)) return null;
  return venue;
}

export function formatSidebarDate(dateStr) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** @deprecated Use formatEventTimeForDisplay with date + timezone for API-backed times. */
export function formatSidebarTime(timeStr, dateStr, timezone) {
  return formatEventTime(dateStr, timeStr, timezone);
}

export function getLowestTicketPrice(tickets = []) {
  if (!tickets.length) return 0;
  const prices = tickets
    .map((ticket) => parseFloat(ticket.price))
    .filter((price) => !Number.isNaN(price));
  if (!prices.length) return 0;
  return Math.min(...prices);
}

export function formatTicketPriceLabel(tickets = []) {
  const minPrice = getLowestTicketPrice(tickets);
  if (!tickets.length) return '0.00';
  if (minPrice === 0) return '0.00';
  return minPrice.toFixed(2);
}
