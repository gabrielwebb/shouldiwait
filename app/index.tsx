import { View, Text, StyleSheet, ActivityIndicator, Platform, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocation } from '@/hooks/useLocation';
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt';
import * as Location from 'expo-location';

export default function Index() {
  const { location, error, loading, permissionStatus, requestPermission } = useLocation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Show loading state while checking permissions
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? '#0A84FF' : '#007AFF'}
          />
          <Text style={[styles.loadingText, { color: isDark ? '#EBEBF5' : '#3C3C43' }]}>
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

  // Show location data (will be replaced with map/list view later)
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Should I Wait?
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#EBEBF5' : '#3C3C43' }]}>
            Find clean bathrooms nearby
          </Text>
        </View>

        {/* Location Info Card */}
        {location && (
          <View style={[styles.locationCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationIcon} accessibilityLabel="Location marker">📍</Text>
              <Text style={[styles.locationLabel, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
                Your Location
              </Text>
            </View>

            <View style={styles.coordinatesContainer}>
              <View style={styles.coordinateRow}>
                <Text style={[styles.coordinateLabel, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
                  Latitude
                </Text>
                <Text
                  style={[styles.coordinateValue, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  accessible={true}
                  accessibilityLabel={`Latitude ${location.latitude.toFixed(6)}`}
                >
                  {location.latitude.toFixed(6)}°
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]} />

              <View style={styles.coordinateRow}>
                <Text style={[styles.coordinateLabel, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
                  Longitude
                </Text>
                <Text
                  style={[styles.coordinateValue, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  accessible={true}
                  accessibilityLabel={`Longitude ${location.longitude.toFixed(6)}`}
                >
                  {location.longitude.toFixed(6)}°
                </Text>
              </View>

              {location.accuracy && (
                <>
                  <View style={[styles.divider, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]} />
                  <View style={styles.accuracyRow}>
                    <Text style={styles.accuracyIcon}>🎯</Text>
                    <Text
                      style={[styles.accuracyText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}
                      accessible={true}
                      accessibilityLabel={`Accuracy within ${Math.round(location.accuracy)} meters`}
                    >
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={[styles.errorCard, { backgroundColor: isDark ? '#3A1A1A' : '#FEF2F2' }]}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={[styles.errorText, { color: isDark ? '#FF6B6B' : '#DC2626' }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Coming Soon Badge */}
        <View style={[styles.comingSoonBadge, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.comingSoonText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
            🗺️ Map view coming soon...
          </Text>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 20, android: 16 }),
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
    marginBottom: 24,
  },
  title: {
    fontSize: Platform.select({ ios: 34, android: 28 }),
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
  },
  subtitle: {
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: '400',
  },
  locationCard: {
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    overflow: 'hidden',
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  locationLabel: {
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: '600',
  },
  coordinatesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  coordinateLabel: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '400',
  },
  coordinateValue: {
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
  },
  divider: {
    height: Platform.select({ ios: StyleSheet.hairlineWidth, android: 1 }),
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    justifyContent: 'center',
  },
  accuracyIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  accuracyText: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    fontWeight: '500',
  },
  errorCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  errorText: {
    flex: 1,
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '500',
    lineHeight: 20,
  },
  comingSoonBadge: {
    marginTop: 'auto',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  comingSoonText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '500',
  },
});
