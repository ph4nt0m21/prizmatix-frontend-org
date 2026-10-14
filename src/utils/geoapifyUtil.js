import {
  buildAddressGeocodeQuery,
  normalizeGoogleMapLink,
} from './eventUtil';

const getGeoapifyApiKey = () => process.env.REACT_APP_GEOAPIFY_API_KEY?.trim() || '';

export const isGeoapifyConfigured = () => Boolean(getGeoapifyApiKey());

/**
 * Build a display string for the address search field from saved location fields.
 */
export const buildLocationSearchLabel = (location = {}) => {
  if (location.formattedAddress?.trim()) {
    return location.formattedAddress.trim();
  }
  return buildAddressGeocodeQuery(location) || '';
};

/**
 * Map a Geoapify autocomplete / geocode feature into LocationStep form fields.
 * Keeps Google Maps link generation so event-app embeds continue to work.
 */
export const mapGeoapifyFeatureToLocation = (feature) => {
  const props = feature?.properties || {};
  const lat = props.lat ?? feature?.geometry?.coordinates?.[1];
  const lon = props.lon ?? feature?.geometry?.coordinates?.[0];
  const parsedLat = lat != null ? parseFloat(lat) : NaN;
  const parsedLon = lon != null ? parseFloat(lon) : NaN;

  const street = props.street || '';
  const streetNumber = props.housenumber || '';
  const city =
    props.city || props.suburb || props.town || props.village || props.county || '';
  const postalCode = props.postcode || '';
  const state = props.state || '';
  const country = props.country || '';
  const formattedAddress = props.formatted || props.address_line1 || '';

  const poiTypes = new Set([
    'amenity',
    'building',
    'commercial',
    'activity',
    'sport',
    'tourism',
    'entertainment',
  ]);
  const isPoi =
    poiTypes.has(props.result_type) ||
    (props.name && props.name !== street && props.name !== formattedAddress);

  const venue = isPoi ? props.name || '' : props.name && props.name !== street ? props.name : '';

  const googleMapLink =
    Number.isFinite(parsedLat) && Number.isFinite(parsedLon)
      ? normalizeGoogleMapLink('', parsedLat, parsedLon)
      : '';

  return {
    venue,
    street,
    streetNumber,
    city,
    postalCode,
    state,
    country,
    formattedAddress,
    latitude: Number.isFinite(parsedLat) ? parsedLat : '',
    longitude: Number.isFinite(parsedLon) ? parsedLon : '',
    googleMapLink,
  };
};

/**
 * Forward-geocode a free-text address query via Geoapify (used for short Google Maps links).
 */
export const geocodeAddressWithGeoapify = async (addressQuery) => {
  const apiKey = getGeoapifyApiKey();
  const query = String(addressQuery || '').trim();
  if (!apiKey || !query) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      text: query,
      apiKey,
      filter: 'countrycode:nz',
      limit: '1',
    });
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?${params.toString()}`
    );
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const feature = data?.features?.[0];
    if (!feature) {
      return null;
    }

    const mapped = mapGeoapifyFeatureToLocation(feature);
    if (!Number.isFinite(mapped.latitude) || !Number.isFinite(mapped.longitude)) {
      return null;
    }

    return {
      lat: mapped.latitude,
      lng: mapped.longitude,
    };
  } catch (error) {
    console.error('Geoapify geocode failed:', error);
    return null;
  }
};
