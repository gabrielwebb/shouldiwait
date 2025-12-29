/**
 * Mock Bathroom Data for Testing
 *
 * Sample bathroom locations in San Francisco area for development and testing.
 * These will be replaced with real data from Convex once the backend is populated.
 */

import { BathroomLocation } from '@/types';

/**
 * Mock bathrooms near San Francisco (default simulator location)
 */
export const MOCK_BATHROOMS: BathroomLocation[] = [
  {
    _id: 'mock-1',
    name: 'Blue Bottle Coffee',
    latitude: 37.7849,
    longitude: -122.4194,
    address: '66 Mint St, San Francisco, CA 94103',
    placeType: 'cafe',
    avgCleanliness: 4.5,
    totalRatings: 23,
    amenities: ['wheelchair_accessible', 'single_stall'],
  },
  {
    _id: 'mock-2',
    name: 'Westfield San Francisco Centre',
    latitude: 37.7843,
    longitude: -122.4060,
    address: '865 Market St, San Francisco, CA 94103',
    placeType: 'shopping_mall',
    avgCleanliness: 3.8,
    totalRatings: 156,
    amenities: ['wheelchair_accessible', 'baby_changing', 'family', 'multiple_stalls'],
  },
  {
    _id: 'mock-3',
    name: 'Yerba Buena Gardens',
    latitude: 37.7849,
    longitude: -122.4015,
    address: '750 Howard St, San Francisco, CA 94103',
    placeType: 'park',
    avgCleanliness: 3.2,
    totalRatings: 45,
    amenities: ['wheelchair_accessible', 'gender_neutral', 'free'],
  },
  {
    _id: 'mock-4',
    name: 'Starbucks Reserve',
    latitude: 37.7899,
    longitude: -122.4125,
    address: '1 Market St, San Francisco, CA 94105',
    placeType: 'cafe',
    avgCleanliness: 4.2,
    totalRatings: 89,
    amenities: ['single_stall', 'free'],
  },
  {
    _id: 'mock-5',
    name: 'Target',
    latitude: 37.7791,
    longitude: -122.4108,
    address: '789 Mission St, San Francisco, CA 94103',
    placeType: 'shopping_mall',
    avgCleanliness: 3.5,
    totalRatings: 67,
    amenities: ['wheelchair_accessible', 'baby_changing', 'multiple_stalls', 'free'],
  },
  {
    _id: 'mock-6',
    name: 'San Francisco Public Library',
    latitude: 37.7796,
    longitude: -122.4161,
    address: '100 Larkin St, San Francisco, CA 94102',
    placeType: 'library',
    avgCleanliness: 4.0,
    totalRatings: 34,
    amenities: ['wheelchair_accessible', 'gender_neutral', 'multiple_stalls', 'free'],
  },
  {
    _id: 'mock-7',
    name: 'Whole Foods Market',
    latitude: 37.7725,
    longitude: -122.4047,
    address: '1185 Market St, San Francisco, CA 94103',
    placeType: 'shopping_mall',
    avgCleanliness: 4.3,
    totalRatings: 112,
    amenities: ['wheelchair_accessible', 'baby_changing', 'single_stall', 'free'],
  },
  {
    _id: 'mock-8',
    name: 'Chevron Gas Station',
    latitude: 37.7755,
    longitude: -122.4183,
    address: '598 Bryant St, San Francisco, CA 94107',
    placeType: 'gas_station',
    avgCleanliness: 2.8,
    totalRatings: 22,
    amenities: ['single_stall'],
  },
  {
    _id: 'mock-9',
    name: 'Hotel Zephyr',
    latitude: 37.8082,
    longitude: -122.4159,
    address: '250 Beach St, San Francisco, CA 94133',
    placeType: 'hotel',
    avgCleanliness: 4.7,
    totalRatings: 201,
    amenities: ['wheelchair_accessible', 'multiple_stalls'],
  },
  {
    _id: 'mock-10',
    name: 'Ferry Building Marketplace',
    latitude: 37.7955,
    longitude: -122.3937,
    address: '1 Ferry Building, San Francisco, CA 94111',
    placeType: 'public',
    avgCleanliness: 3.9,
    totalRatings: 178,
    amenities: ['wheelchair_accessible', 'baby_changing', 'gender_neutral', 'multiple_stalls', 'free'],
  },
];

/**
 * Get mock bathrooms near a specific location
 * In production, this would be replaced with a Convex query
 */
export function getMockBathroomsNearby(
  userLat: number,
  userLng: number,
  radiusMiles: number = 5
): BathroomLocation[] {
  // Calculate distance for each bathroom
  const bathroomsWithDistance = MOCK_BATHROOMS.map((bathroom) => ({
    ...bathroom,
    distance: calculateDistance(userLat, userLng, bathroom.latitude, bathroom.longitude),
  }));

  // Filter by radius and sort by distance
  return bathroomsWithDistance
    .filter((bathroom) => bathroom.distance! <= radiusMiles)
    .sort((a, b) => a.distance! - b.distance!);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
