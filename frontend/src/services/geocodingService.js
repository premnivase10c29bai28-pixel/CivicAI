/**
 * OpenStreetMap Nominatim Reverse Geocoding Service
 * Prototype implementation complying with Nominatim usage guidelines.
 */

// In-memory cache to avoid redundant requests for the same coordinates
const geocodeCache = new Map();
let activeAbortController = null;

/**
 * Reverse geocodes latitude & longitude into real geographic address details.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{
 *   displayName: string,
 *   city: string,
 *   district: string,
 *   state: string,
 *   rawAddress: object
 * }>}
 */
export async function reverseGeocodeNominatim(latitude, longitude) {
  if (latitude == null || longitude == null) {
    throw new Error("Latitude and longitude are required for reverse geocoding.");
  }

  const latNum = parseFloat(Number(latitude).toFixed(6));
  const lngNum = parseFloat(Number(longitude).toFixed(6));
  const cacheKey = `${latNum.toFixed(4)},${lngNum.toFixed(4)}`;

  // Return cached result if available
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // Abort previous in-flight request to respect rate-limiting
  if (activeAbortController) {
    activeAbortController.abort();
  }
  activeAbortController = new AbortController();
  const signal = activeAbortController.signal;

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", latNum.toString());
  url.searchParams.set("lon", lngNum.toString());
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal
    });

    if (!response.ok) {
      throw new Error(`Reverse geocode failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data || data.error) {
      throw new Error(data?.error || "Location could not be resolved by Nominatim.");
    }

    const addr = data.address || {};
    const displayName = data.display_name || "";
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || "";
    const district = addr.state_district || addr.district || addr.county || "";
    const state = addr.state || "";

    const result = {
      displayName,
      city,
      district,
      state,
      rawAddress: addr
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    if (err.name === "AbortError") {
      throw err;
    }
    console.warn("[geocodingService] Reverse geocode error:", err.message);
    throw err;
  } finally {
    if (activeAbortController?.signal === signal) {
      activeAbortController = null;
    }
  }
}
