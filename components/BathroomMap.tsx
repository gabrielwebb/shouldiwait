/**
 * BathroomMap Component
 *
 * Displays a map view with user location and bathroom markers.
 * Supports light/dark mode, platform defaults (Apple Maps on iOS),
 * and beautiful iOS-native styling.
 */

import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  useColorScheme,
  Platform,
  Pressable,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { getMapStyle, MAP_DELTAS, MAP_ANIMATION_DURATION } from '@/constants/MapStyles';
import { getCleanlinessColor, getBackgroundColor, getTextColor, getBlue } from '@/constants/Colors';

export interface BathroomLocation {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  placeType: string;
  avgCleanliness?: number;
  distance?: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

interface BathroomMapProps {
  userLocation: UserLocation | null;
  bathrooms: BathroomLocation[];
  onMarkerPress?: (bathroom: BathroomLocation) => void;
  onMapPress?: () => void;
}

export function BathroomMap({
  userLocation,
  bathrooms,
  onMarkerPress,
  onMapPress,
}: BathroomMapProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mapRef = useRef<MapView>(null);

  // Initial region based on user location or default to San Francisco
  const initialRegion: Region = {
    latitude: userLocation?.latitude ?? 37.7749,
    longitude: userLocation?.longitude ?? -122.4194,
    ...MAP_DELTAS.MEDIUM,
  };

  // Animate to user location when it becomes available
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          ...MAP_DELTAS.MEDIUM,
        },
        MAP_ANIMATION_DURATION
      );
    }
  }, [userLocation]);

  // Function to recenter map on user location
  const recenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          ...MAP_DELTAS.MEDIUM,
        },
        MAP_ANIMATION_DURATION
      );
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT} // Apple Maps on iOS, Google on Android
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={getMapStyle(isDark)}
        showsUserLocation={true}
        showsMyLocationButton={false} // We'll use custom button
        showsCompass={true}
        showsScale={Platform.OS === 'ios'}
        onPress={onMapPress}
        pitchEnabled={true}
        rotateEnabled={true}
        accessible={true}
        accessibilityLabel="Map showing nearby bathrooms"
      >
        {/* Bathroom markers */}
        {bathrooms.map((bathroom) => (
          <Marker
            key={bathroom._id}
            coordinate={{
              latitude: bathroom.latitude,
              longitude: bathroom.longitude,
            }}
            title={bathroom.name}
            description={bathroom.address}
            onPress={() => onMarkerPress?.(bathroom)}
            accessible={true}
            accessibilityLabel={`${bathroom.name} bathroom location`}
          >
            {/* Custom marker view */}
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor: getMarkerColor(bathroom.avgCleanliness, isDark),
                  },
                ]}
              >
                <Text style={styles.markerIcon}>🚻</Text>
              </View>
              {bathroom.avgCleanliness !== undefined && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: getBackgroundColor(isDark, true),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: getTextColor(isDark) },
                    ]}
                  >
                    {bathroom.avgCleanliness.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Custom recenter button */}
      <Pressable
        style={({ pressed }) => [
          styles.recenterButton,
          {
            backgroundColor: getBackgroundColor(isDark, true),
          },
          pressed && styles.recenterButtonPressed,
        ]}
        onPress={recenterMap}
        accessible={true}
        accessibilityLabel="Recenter map on your location"
        accessibilityRole="button"
      >
        <Text style={styles.recenterIcon}>📍</Text>
      </Pressable>

      {/* Bathroom count indicator */}
      {bathrooms.length > 0 && (
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: getBackgroundColor(isDark, true),
            },
          ]}
        >
          <Text
            style={[
              styles.countText,
              { color: getBlue(isDark) },
            ]}
          >
            {bathrooms.length} {bathrooms.length === 1 ? 'bathroom' : 'bathrooms'} nearby
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Get marker color based on cleanliness rating
 */
function getMarkerColor(avgCleanliness: number | undefined, isDark: boolean): string {
  return getCleanlinessColor(avgCleanliness);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },

  // Marker styles
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  markerIcon: {
    fontSize: 20,
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: Platform.select({ ios: -0.3, android: 0 }),
  },

  // Recenter button
  recenterButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  recenterButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  recenterIcon: {
    fontSize: 24,
  },

  // Count badge
  countBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Platform.select({ ios: 20, android: 16 }),
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
  countText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '600',
    letterSpacing: Platform.select({ ios: -0.4, android: 0 }),
  },
});
