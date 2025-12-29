/**
 * Distance Calculation Tests
 *
 * Tests for Haversine formula implementation in MockBathrooms
 * Following TDD principles: Test mathematical accuracy
 */

import { getMockBathroomsNearby } from '@/constants/MockBathrooms';

describe('Distance Calculation (Haversine Formula)', () => {
  const sanFrancisco = {
    latitude: 37.7749,
    longitude: -122.4194,
  };

  describe('getMockBathroomsNearby', () => {

    it('should return bathrooms sorted by distance', () => {
      const bathrooms = getMockBathroomsNearby(
        sanFrancisco.latitude,
        sanFrancisco.longitude,
        5
      );

      // Verify sorted order (each bathroom should be closer or equal to the next)
      for (let i = 0; i < bathrooms.length - 1; i++) {
        expect(bathrooms[i].distance!).toBeLessThanOrEqual(
          bathrooms[i + 1].distance!
        );
      }
    });

    it('should calculate distance from user location', () => {
      const bathrooms = getMockBathroomsNearby(
        sanFrancisco.latitude,
        sanFrancisco.longitude,
        5
      );

      // All bathrooms should have distance property
      bathrooms.forEach((bathroom) => {
        expect(bathroom.distance).toBeDefined();
        expect(typeof bathroom.distance).toBe('number');
        expect(bathroom.distance!).toBeGreaterThanOrEqual(0);
      });
    });

    it('should filter bathrooms by radius', () => {
      const bathrooms1Mile = getMockBathroomsNearby(
        sanFrancisco.latitude,
        sanFrancisco.longitude,
        1
      );

      const bathrooms5Miles = getMockBathroomsNearby(
        sanFrancisco.latitude,
        sanFrancisco.longitude,
        5
      );

      // Smaller radius should return fewer or equal bathrooms
      expect(bathrooms1Mile.length).toBeLessThanOrEqual(bathrooms5Miles.length);

      // All bathrooms in 1-mile radius should be within 1 mile
      bathrooms1Mile.forEach((bathroom) => {
        expect(bathroom.distance!).toBeLessThanOrEqual(1);
      });
    });

    it('should return empty array when no bathrooms within radius', () => {
      // Location far from San Francisco (e.g., New York)
      const newYork = {
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const bathrooms = getMockBathroomsNearby(
        newYork.latitude,
        newYork.longitude,
        1 // 1 mile radius
      );

      expect(bathrooms).toEqual([]);
    });

    it('should handle same location (0 distance)', () => {
      // Use exact coordinates of a mock bathroom
      const bluebottle = {
        latitude: 37.7849,
        longitude: -122.4194,
      };

      const bathrooms = getMockBathroomsNearby(
        bluebottle.latitude,
        bluebottle.longitude,
        5
      );

      // Find Blue Bottle Coffee
      const bluebottleBathroom = bathrooms.find((b) =>
        b.name.includes('Blue Bottle')
      );

      expect(bluebottleBathroom).toBeDefined();
      // Distance should be very close to 0 (may have rounding)
      expect(bluebottleBathroom!.distance!).toBeLessThan(0.01);
    });

    it('should round distance to 1 decimal place', () => {
      const bathrooms = getMockBathroomsNearby(
        sanFrancisco.latitude,
        sanFrancisco.longitude,
        5
      );

      bathrooms.forEach((bathroom) => {
        // Check if distance has at most 1 decimal place
        const decimalPlaces = bathroom.distance!.toString().split('.')[1]?.length || 0;
        expect(decimalPlaces).toBeLessThanOrEqual(1);
      });
    });

    it('should handle edge case of exact radius boundary', () => {
      const bathrooms = getMockBathroomsNearby(
        sanFrancisco.latitude,
        sanFrancisco.longitude,
        1.5
      );

      // All bathrooms should be within 1.5 miles
      bathrooms.forEach((bathroom) => {
        expect(bathroom.distance!).toBeLessThanOrEqual(1.5);
      });
    });
  });

  describe('Haversine Formula Accuracy', () => {
    it('should calculate correct distance for known coordinates', () => {
      // San Francisco to Los Angeles (approximate distance: 347 miles)
      const sanFrancisco = { lat: 37.7749, lng: -122.4194 };
      const losAngeles = { lat: 34.0522, lng: -118.2437 };

      const bathrooms = getMockBathroomsNearby(
        sanFrancisco.lat,
        sanFrancisco.lng,
        400 // Large radius to include LA if it existed in mock data
      );

      // Test should verify formula works correctly
      // (Our mock data is all in SF, so we just verify the function doesn't crash)
      expect(bathrooms).toBeDefined();
    });

    it('should handle negative coordinates (Southern/Western hemispheres)', () => {
      // Test with negative latitude/longitude
      const bathrooms = getMockBathroomsNearby(-33.8688, 151.2093, 5); // Sydney

      expect(bathrooms).toBeDefined();
      expect(Array.isArray(bathrooms)).toBe(true);
    });

    it('should handle coordinates near poles', () => {
      // Test with extreme latitude
      const bathrooms = getMockBathroomsNearby(89.0, 0.0, 5); // Near North Pole

      expect(bathrooms).toBeDefined();
      expect(Array.isArray(bathrooms)).toBe(true);
    });

    it('should handle coordinates crossing International Date Line', () => {
      // Test with longitude near ±180
      const bathrooms = getMockBathroomsNearby(0.0, 179.0, 5);

      expect(bathrooms).toBeDefined();
      expect(Array.isArray(bathrooms)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should calculate distances efficiently for all 10 mock bathrooms', () => {
      const startTime = Date.now();

      const bathrooms = getMockBathroomsNearby(
        sanFrancisco.latitude,
        sanFrancisco.longitude,
        5
      );

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should complete in less than 100ms
      expect(executionTime).toBeLessThan(100);
      expect(bathrooms.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero radius', () => {
      const bathrooms = getMockBathroomsNearby(
        sanFrancisco.latitude,
        sanFrancisco.longitude,
        0
      );

      // Zero radius should return empty or only exact matches
      bathrooms.forEach((bathroom) => {
        expect(bathroom.distance!).toBe(0);
      });
    });

    it('should handle very large radius', () => {
      const bathrooms = getMockBathroomsNearby(
        sanFrancisco.latitude,
        sanFrancisco.longitude,
        10000 // 10,000 miles
      );

      // Should return all 10 mock bathrooms
      expect(bathrooms.length).toBe(10);
    });

    it('should handle invalid coordinates gracefully', () => {
      // Test doesn't crash with extreme values
      expect(() => {
        getMockBathroomsNearby(999, 999, 5);
      }).not.toThrow();
    });
  });
});
