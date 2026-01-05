import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, useColorScheme, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocation } from '@/hooks/useLocation';
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt';
import { BathroomMap } from '@/components/BathroomMap';
import { BathroomMapWeb } from '@/components/BathroomMapWeb';
import { BathroomList } from '@/components/BathroomList';
import { ViewToggle } from '@/components/ViewToggle';
import { BathroomLocation } from '@/types';
import * as Location from 'expo-location';
import { getBackgroundColor, getTextColor, getBlue, Special, Yellow } from '@/constants/Colors';

export default function Index() {
  const router = useRouter();
  const { location, error, loading, permissionStatus, requestPermission, refreshLocation } = useLocation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedBathroom, setSelectedBathroom] = useState<BathroomLocation | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list'); // Start with list view
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasQueryTimedOut, setHasQueryTimedOut] = useState(false);

  // Fetch nearby bathrooms from Convex backend
  const nearbyBathroomsRaw = useQuery(
    api.locations.getNearby,
    location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          radiusMiles: 5,
        }
      : "skip"
  );

  // Detect if query has been loading too long (likely an error)
  useEffect(() => {
    if (nearbyBathroomsRaw === undefined && location) {
      const timeout = setTimeout(() => {
        setHasQueryTimedOut(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    } else {
      setHasQueryTimedOut(false);
    }
  }, [nearbyBathroomsRaw, location]);

  // Convert Convex response to BathroomLocation type and calculate distance
  const nearbyBathrooms: BathroomLocation[] = (nearbyBathroomsRaw || []).map((loc) => {
    // Calculate distance if we have user location
    let distance = 0;
    if (location) {
      const R = 3959; // Earth's radius in miles
      const dLat = (loc.latitude - location.latitude) * Math.PI / 180;
      const dLon = (loc.longitude - location.longitude) * Math.PI / 180;
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(location.latitude * Math.PI / 180) * Math.cos(loc.latitude * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance = R * c;
    }

    return {
      _id: loc._id,
      id: loc._id,
      name: loc.name,
      address: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude,
      amenities: loc.amenities,
      placeType: loc.placeType,
      distance: parseFloat(distance.toFixed(1)),
      averageRating: 0, // TODO: Calculate from ratings
    };
  })
  .filter((bathroom) => bathroom.distance <= 5) // Filter to within 5 miles
  .sort((a, b) => a.distance - b.distance); // Sort by distance

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setHasQueryTimedOut(false);
    if (refreshLocation) {
      await refreshLocation();
    }
    // Brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsRefreshing(false);
  };

  // Show loading state while checking permissions
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColor(isDark) }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={getBlue(isDark)}
          />
          <Text style={[styles.loadingText, { color: getTextColor(isDark, 'secondary') }]}>
            Getting your location...
          </Text>
        </View>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaView>
    );
  }

  // Show permission prompt if permission not granted
  if (permissionStatus !== Location.PermissionStatus.GRANTED) {
    return (
      <>
        <LocationPermissionPrompt
          permissionStatus={permissionStatus}
          onRequestPermission={requestPermission}
          error={error}
        />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </>
    );
  }

  // Main app view with map
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColor(isDark) }]} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: getBackgroundColor(isDark) }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: getTextColor(isDark) }]}>
                Should I Wait? 🚽
              </Text>
              <Text style={[styles.subtitle, { color: getTextColor(isDark, 'secondary') }]}>
                {nearbyBathrooms.length > 0
                  ? `✨ ${nearbyBathrooms.length} clean ${nearbyBathrooms.length === 1 ? 'bathroom' : 'bathrooms'} nearby`
                  : 'Finding bathrooms nearby...'}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.profileButton,
                { backgroundColor: Yellow.primary },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </Pressable>
          </View>
        </View>

        {/* View Toggle */}
        <ViewToggle viewMode={viewMode} onToggle={setViewMode} />

        {/* Error State */}
        {nearbyBathroomsRaw === undefined && hasQueryTimedOut ? (
          <View style={styles.errorContainer}>
            <View style={[styles.errorCard, { backgroundColor: getBackgroundColor(isDark, true) }]}>
              <Text style={[styles.errorTitle, { color: getTextColor(isDark) }]}>
                Unable to Load Bathrooms
              </Text>
              <Text style={[styles.errorText, { color: getTextColor(isDark, 'secondary') }]}>
                Please check your internet connection and try again.
              </Text>
              <Pressable
                onPress={handleRefresh}
                style={({ pressed }) => [
                  styles.retryButton,
                  { backgroundColor: getBlue(isDark) },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* List View or Map View */
          <View style={styles.viewContainer}>
            {viewMode === 'list' ? (
            <BathroomList
              bathrooms={nearbyBathrooms}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              onBathroomPress={(bathroom) => {
                setSelectedBathroom(bathroom);
                console.log('Selected bathroom:', bathroom.name);
              }}
            />
          ) : Platform.OS === 'web' ? (
            <BathroomMapWeb
              userLocation={location}
              bathrooms={nearbyBathrooms}
              onMarkerPress={(bathroom) => {
                setSelectedBathroom(bathroom);
                console.log('Selected bathroom:', bathroom.name);
              }}
              onMapPress={() => {
                setSelectedBathroom(null);
              }}
            />
          ) : (
            <BathroomMap
              userLocation={location}
              bathrooms={nearbyBathrooms}
              onMarkerPress={(bathroom) => {
                setSelectedBathroom(bathroom);
                console.log('Selected bathroom:', bathroom.name);
              }}
              onMapPress={() => {
                setSelectedBathroom(null);
              }}
            />
          )}
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: isDark ? Special.errorBackground.dark : Special.errorBackground.light }]}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={[styles.errorText, { color: isDark ? '#FF6B6B' : '#DC2626' }]}>
              {error}
            </Text>
          </View>
        )}
      </View>

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: Platform.select({ ios: 17, android: 16 }),
  },
  header: {
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    paddingTop: Platform.select({ ios: 8, android: 16 }),
    paddingBottom: 12,
  },
  title: {
    fontSize: Platform.select({ ios: 28, android: 24 }),
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
  },
  subtitle: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '500',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.select({ ios: 8, android: 16 }),
  },
  profileIcon: {
    fontSize: 24,
  },
  viewContainer: {
    flex: 1,
  },
  errorBanner: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: Platform.select({ ios: 14, android: 13 }),
    fontWeight: '500',
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    padding: 32,
    alignItems: 'center',
    gap: 16,
    maxWidth: 400,
    width: '100%',
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
  errorTitle: {
    fontSize: Platform.select({ ios: 20, android: 18 }),
    fontWeight: '700',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: Platform.select({ ios: 12, android: 8 }),
    minWidth: 140,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: Platform.select({ ios: 17, android: 15 }),
    fontWeight: '600',
  },
});
