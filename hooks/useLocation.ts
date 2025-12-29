import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface UseLocationResult {
  location: LocationCoords | null;
  error: string | null;
  loading: boolean;
  permissionStatus: Location.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  // Request location permissions
  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Location permission denied. Please enable location access in Settings.');
        setLoading(false);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request location permission';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        accuracy: locationData.coords.accuracy,
      });

      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current location';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Refresh location manually
  const refreshLocation = async (): Promise<void> => {
    const hasPermission = await requestPermission();
    if (hasPermission) {
      await getCurrentLocation();
    }
  };

  // Initial permission check and location fetch
  useEffect(() => {
    const initializeLocation = async () => {
      // Check existing permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status === Location.PermissionStatus.GRANTED) {
        await getCurrentLocation();
      } else {
        setLoading(false);
      }
    };

    initializeLocation();
  }, []);

  return {
    location,
    error,
    loading,
    permissionStatus,
    requestPermission,
    refreshLocation,
  };
}
