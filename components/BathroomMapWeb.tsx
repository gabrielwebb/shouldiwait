/**
 * Web Fallback for Bathroom Map
 *
 * Since react-native-maps doesn't work on web, we provide a static map
 * with markers using Google Maps Static API or a simple list view.
 */

import { View, Text, StyleSheet, Platform, useColorScheme, Pressable, Linking } from 'react-native';
import { BathroomLocation, UserLocation } from '@/types';
import { getTextColor, getBackgroundColor, Yellow } from '@/constants/Colors';

interface BathroomMapWebProps {
  userLocation: UserLocation | null;
  bathrooms: BathroomLocation[];
  onMarkerPress?: (bathroom: BathroomLocation) => void;
  onMapPress?: () => void;
}

export function BathroomMapWeb({
  userLocation,
  bathrooms,
  onMarkerPress,
}: BathroomMapWebProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Generate Google Maps URL for static map image
  const getStaticMapUrl = () => {
    if (!userLocation) return null;

    const markers = bathrooms
      .slice(0, 10) // Limit to 10 markers
      .map(
        (b, i) =>
          `markers=color:red%7Clabel:${i + 1}%7C${b.latitude},${b.longitude}`
      )
      .join('&');

    const center = `${userLocation.latitude},${userLocation.longitude}`;
    const zoom = 14;
    const size = '600x400';

    // Note: Requires Google Maps Static API key in production
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${size}&${markers}&key=YOUR_API_KEY`;
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor(isDark) }]}>
      {/* Web Message */}
      <View style={[styles.messageContainer, { backgroundColor: getBackgroundColor(isDark, true) }]}>
        <Text style={[styles.messageIcon]}>🗺️</Text>
        <Text style={[styles.messageTitle, { color: getTextColor(isDark) }]}>
          Interactive Map (Mobile Only)
        </Text>
        <Text style={[styles.messageText, { color: getTextColor(isDark, 'secondary') }]}>
          The interactive map is only available on iOS and Android.
          {'\n'}
          Use the list view to browse bathrooms, or open in Google Maps below.
        </Text>
      </View>

      {/* Open in Google Maps Button */}
      {userLocation && (
        <Pressable
          onPress={() => {
            const url = `https://www.google.com/maps/search/bathrooms/@${userLocation.latitude},${userLocation.longitude},14z`;
            Linking.openURL(url);
          }}
          style={({ pressed }) => [
            styles.openMapsButton,
            { backgroundColor: Yellow.primary },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.openMapsIcon}>🗺️</Text>
          <Text style={styles.openMapsText}>Open in Google Maps</Text>
        </Pressable>
      )}

      {/* Bathroom List (fallback) */}
      <View style={styles.listContainer}>
        <Text style={[styles.listTitle, { color: getTextColor(isDark) }]}>
          Nearby Bathrooms ({bathrooms.length})
        </Text>
        {bathrooms.slice(0, 5).map((bathroom, index) => (
          <Pressable
            key={bathroom._id}
            onPress={() => onMarkerPress?.(bathroom)}
            style={({ pressed }) => [
              styles.listItem,
              { backgroundColor: getBackgroundColor(isDark, true) },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.listNumber}>{index + 1}</Text>
            <View style={styles.listContent}>
              <Text style={[styles.listName, { color: getTextColor(isDark) }]}>
                {bathroom.name}
              </Text>
              <Text style={[styles.listAddress, { color: getTextColor(isDark, 'secondary') }]}>
                {bathroom.distance?.toFixed(1)} mi • {bathroom.address}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  messageIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: Platform.select({ web: 20, default: 18 }),
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  messageText: {
    fontSize: Platform.select({ web: 15, default: 14 }),
    textAlign: 'center',
    lineHeight: 22,
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  openMapsIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  openMapsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  listNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 12,
    color: Yellow.primary,
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  listAddress: {
    fontSize: 13,
  },
});
