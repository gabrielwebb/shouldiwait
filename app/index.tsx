import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocation } from '@/hooks/useLocation';
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt';
import { BathroomMap } from '@/components/BathroomMap';
import { BathroomList } from '@/components/BathroomList';
import { ViewToggle } from '@/components/ViewToggle';
import { getMockBathroomsNearby } from '@/constants/MockBathrooms';
import { BathroomLocation } from '@/types';
import * as Location from 'expo-location';
import { getBackgroundColor, getTextColor, getBlue, Special, Yellow } from '@/constants/Colors';

export default function Index() {
  const { location, error, loading, permissionStatus, requestPermission, refreshLocation } = useLocation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedBathroom, setSelectedBathroom] = useState<BathroomLocation | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list'); // Start with list view
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get nearby bathrooms based on user location
  const nearbyBathrooms = location
    ? getMockBathroomsNearby(location.latitude, location.longitude, 5)
    : [];

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshLocation) {
      await refreshLocation();
    }
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
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
          <Text style={[styles.title, { color: getTextColor(isDark) }]}>
            Should I Wait? 🚽
          </Text>
          <Text style={[styles.subtitle, { color: getTextColor(isDark, 'secondary') }]}>
            {nearbyBathrooms.length > 0
              ? `✨ ${nearbyBathrooms.length} clean ${nearbyBathrooms.length === 1 ? 'bathroom' : 'bathrooms'} nearby`
              : 'Finding bathrooms nearby...'}
          </Text>
        </View>

        {/* View Toggle */}
        <ViewToggle viewMode={viewMode} onToggle={setViewMode} />

        {/* List View or Map View */}
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
    paddingTop: Platform.select({ ios: 8, android: 16 }),
    paddingBottom: 12,
    zIndex: 10,
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
});
