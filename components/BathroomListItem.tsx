/**
 * BathroomListItem Component
 *
 * Individual bathroom card for the list view.
 * Displays name, distance, rating, address, and navigation button.
 * iOS-styled with dark mode support.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useColorScheme,
  Linking,
} from 'react-native';
import { BathroomLocation } from '@/types';

interface BathroomListItemProps {
  bathroom: BathroomLocation;
  onPress?: (bathroom: BathroomLocation) => void;
}

export function BathroomListItem({ bathroom, onPress }: BathroomListItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get color based on cleanliness rating
  const getRatingColor = () => {
    if (!bathroom.avgCleanliness) return isDark ? '#48484A' : '#8E8E93';
    if (bathroom.avgCleanliness >= 4.0) return '#34C759'; // Green
    if (bathroom.avgCleanliness >= 3.0) return '#FFD60A'; // Yellow
    return '#FF453A'; // Red
  };

  // Open navigation in Apple Maps (iOS) or Google Maps (Android)
  const handleNavigate = () => {
    const label = encodeURIComponent(bathroom.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${bathroom.latitude},${bathroom.longitude}`,
      android: `geo:0,0?q=${bathroom.latitude},${bathroom.longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${bathroom.latitude},${bathroom.longitude}`,
    });

    Linking.openURL(url!).catch((err) =>
      console.error('Error opening maps:', err)
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        },
        pressed && styles.pressed,
      ]}
      onPress={() => onPress?.(bathroom)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${bathroom.name}, ${bathroom.distance} miles away, rated ${bathroom.avgCleanliness || 'unrated'}`}
    >
      {/* Top row: Name and Rating */}
      <View style={styles.topRow}>
        <View style={styles.nameContainer}>
          <Text
            style={[styles.name, { color: isDark ? '#FFFFFF' : '#000000' }]}
            numberOfLines={1}
          >
            {bathroom.name}
          </Text>
          <Text
            style={[styles.placeType, { color: isDark ? '#8E8E93' : '#8E8E93' }]}
            numberOfLines={1}
          >
            {formatPlaceType(bathroom.placeType)}
          </Text>
        </View>

        {/* Rating Badge */}
        {bathroom.avgCleanliness !== undefined && (
          <View
            style={[
              styles.ratingBadge,
              { backgroundColor: getRatingColor() + '20' },
            ]}
          >
            <Text
              style={[styles.ratingText, { color: getRatingColor() }]}
              accessible={true}
              accessibilityLabel={`Cleanliness rating ${bathroom.avgCleanliness.toFixed(1)} out of 5`}
            >
              {bathroom.avgCleanliness.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Distance and Total Ratings */}
      <View style={styles.metaRow}>
        {bathroom.distance !== undefined && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceIcon}>📍</Text>
            <Text
              style={[styles.distance, { color: isDark ? '#0A84FF' : '#007AFF' }]}
              accessible={true}
              accessibilityLabel={`${bathroom.distance} miles away`}
            >
              {bathroom.distance.toFixed(1)} mi
            </Text>
          </View>
        )}

        {bathroom.totalRatings !== undefined && bathroom.totalRatings > 0 && (
          <Text
            style={[styles.totalRatings, { color: isDark ? '#8E8E93' : '#8E8E93' }]}
          >
            • {bathroom.totalRatings} {bathroom.totalRatings === 1 ? 'rating' : 'ratings'}
          </Text>
        )}
      </View>

      {/* Address */}
      <Text
        style={[styles.address, { color: isDark ? '#EBEBF5' : '#3C3C43' }]}
        numberOfLines={1}
      >
        {bathroom.address}
      </Text>

      {/* Amenities */}
      {bathroom.amenities && bathroom.amenities.length > 0 && (
        <View style={styles.amenitiesContainer}>
          {bathroom.amenities.slice(0, 3).map((amenity, index) => (
            <View
              key={index}
              style={[
                styles.amenityBadge,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                },
              ]}
            >
              <Text style={[styles.amenityText, { color: isDark ? '#EBEBF5' : '#3C3C43' }]}>
                {formatAmenity(amenity)}
              </Text>
            </View>
          ))}
          {bathroom.amenities.length > 3 && (
            <Text style={[styles.moreAmenities, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
              +{bathroom.amenities.length - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Navigate Button */}
      <Pressable
        style={({ pressed }) => [
          styles.navigateButton,
          {
            backgroundColor: isDark ? '#0A84FF' : '#007AFF',
          },
          pressed && styles.navigateButtonPressed,
        ]}
        onPress={handleNavigate}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Get directions to ${bathroom.name}`}
      >
        <Text style={styles.navigateIcon}>🧭</Text>
        <Text style={styles.navigateText}>Directions</Text>
      </Pressable>
    </Pressable>
  );
}

/**
 * Format place type for display
 */
function formatPlaceType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format amenity for display
 */
function formatAmenity(amenity: string): string {
  const formatted = amenity
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Add emoji indicators
  if (amenity === 'wheelchair_accessible') return '♿ ' + formatted;
  if (amenity === 'baby_changing') return '🍼 ' + formatted;
  if (amenity === 'gender_neutral') return '🚻 ' + formatted;
  if (amenity === 'free') return '💸 ' + formatted;

  return formatted;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: Platform.select({ ios: -0.4, android: 0 }),
  },
  placeType: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    fontWeight: '400',
  },

  // Rating badge
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '700',
    letterSpacing: Platform.select({ ios: -0.3, android: 0 }),
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  distance: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '600',
    letterSpacing: Platform.select({ ios: -0.3, android: 0 }),
  },
  totalRatings: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    marginLeft: 8,
  },

  // Address
  address: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    marginBottom: 12,
    lineHeight: 18,
  },

  // Amenities
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  amenityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: Platform.select({ ios: 11, android: 10 }),
    fontWeight: '500',
  },
  moreAmenities: {
    fontSize: Platform.select({ ios: 11, android: 10 }),
    marginLeft: 4,
  },

  // Navigate button
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  navigateButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  navigateIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  navigateText: {
    color: '#FFFFFF',
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '600',
    letterSpacing: Platform.select({ ios: -0.3, android: 0 }),
  },
});
