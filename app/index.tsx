import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocation } from '@/hooks/useLocation';
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt';
import * as Location from 'expo-location';

export default function Index() {
  const { location, error, loading, permissionStatus, requestPermission } = useLocation();

  // Show loading state while checking permissions
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Getting your location...</Text>
        <StatusBar style="auto" />
      </View>
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
        <StatusBar style="auto" />
      </>
    );
  }

  // Show location data (will be replaced with map/list view later)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Should I Wait?</Text>
      <Text style={styles.subtitle}>Find clean bathrooms nearby</Text>

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Your Location:</Text>
          <Text style={styles.locationText}>
            Lat: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Lng: {location.longitude.toFixed(6)}
          </Text>
          {location.accuracy && (
            <Text style={styles.accuracyText}>
              Accuracy: ±{Math.round(location.accuracy)}m
            </Text>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  locationInfo: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
});
