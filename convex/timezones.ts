/**
 * Timezone utilities for location-based time calculations
 *
 * Uses a lightweight approach without external APIs:
 * - Approximate timezone from longitude offset
 * - Fallback to common US timezones by region
 */

// Approximate timezone from longitude (simple but effective for US locations)
export function getTimezoneFromCoordinates(latitude: number, longitude: number): string {
  // Common US timezone boundaries (approximate)
  const timezones = [
    { name: "America/New_York", minLng: -85, maxLng: -67 },      // Eastern
    { name: "America/Chicago", minLng: -104, maxLng: -85 },       // Central
    { name: "America/Denver", minLng: -115, maxLng: -104 },       // Mountain
    { name: "America/Los_Angeles", minLng: -125, maxLng: -115 },  // Pacific
    { name: "America/Anchorage", minLng: -180, maxLng: -130 },    // Alaska
    { name: "Pacific/Honolulu", minLng: -180, maxLng: -154 },     // Hawaii
  ];

  // Special case: Hawaii (by latitude)
  if (latitude >= 18 && latitude <= 23 && longitude >= -161 && longitude <= -154) {
    return "Pacific/Honolulu";
  }

  // Special case: Alaska (by latitude)
  if (latitude >= 51 && latitude <= 72) {
    return "America/Anchorage";
  }

  // Find timezone by longitude
  for (const tz of timezones) {
    if (longitude >= tz.minLng && longitude <= tz.maxLng) {
      return tz.name;
    }
  }

  // Default fallback
  return "America/New_York";
}

// Comprehensive timezone mapping for major cities (backup method)
export const CITY_TIMEZONES: Record<string, string> = {
  // West Coast
  "Seattle": "America/Los_Angeles",
  "Portland": "America/Los_Angeles",
  "San Francisco": "America/Los_Angeles",
  "Los Angeles": "America/Los_Angeles",
  "San Diego": "America/Los_Angeles",

  // Mountain
  "Phoenix": "America/Phoenix", // Arizona doesn't observe DST
  "Denver": "America/Denver",
  "Salt Lake City": "America/Denver",

  // Central
  "Chicago": "America/Chicago",
  "Dallas": "America/Chicago",
  "Houston": "America/Chicago",
  "Austin": "America/Chicago",

  // Eastern
  "New York": "America/New_York",
  "Boston": "America/New_York",
  "Miami": "America/New_York",
  "Atlanta": "America/New_York",
  "Washington": "America/New_York",
};

// Extract city from address string and lookup timezone
export function getTimezoneFromAddress(address: string): string | null {
  for (const [city, timezone] of Object.entries(CITY_TIMEZONES)) {
    if (address.includes(city)) {
      return timezone;
    }
  }
  return null;
}

// Main function: Get timezone with multiple fallback strategies
export function detectTimezone(
  latitude: number,
  longitude: number,
  address?: string
): string {
  // Strategy 1: Try address-based lookup (most accurate)
  if (address) {
    const addressTimezone = getTimezoneFromAddress(address);
    if (addressTimezone) return addressTimezone;
  }

  // Strategy 2: Use coordinate-based approximation
  return getTimezoneFromCoordinates(latitude, longitude);
}
