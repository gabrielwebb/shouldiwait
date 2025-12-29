/**
 * Shared TypeScript types and interfaces
 */

export interface BathroomLocation {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  placeType: string;
  amenities?: string[];
  avgCleanliness?: number;
  totalRatings?: number;
  distance?: number; // Distance from user in miles
  createdAt?: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface Rating {
  _id: string;
  locationId: string;
  userId: string;
  cleanliness: number; // 1-5
  review?: string;
  timestamp: number;
}

export interface Photo {
  _id: string;
  locationId: string;
  userId: string;
  storageId: string;
  url?: string; // CDN URL from Convex Storage
  ratingId?: string;
  timestamp: number;
}

export interface CleanlinessInsight {
  locationId: string;
  avgCleanliness: number;
  totalRatings: number;
  peakCleanHour?: number; // 0-23
  peakDirtyHour?: number; // 0-23
  trend?: 'improving' | 'declining' | 'stable';
}

export type PlaceType =
  | 'restaurant'
  | 'cafe'
  | 'gas_station'
  | 'shopping_mall'
  | 'park'
  | 'library'
  | 'hotel'
  | 'public'
  | 'other';

export type Amenity =
  | 'wheelchair_accessible'
  | 'baby_changing'
  | 'gender_neutral'
  | 'family'
  | 'single_stall'
  | 'multiple_stalls'
  | 'free';
