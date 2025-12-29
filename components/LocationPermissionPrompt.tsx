import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Linking } from 'react-native';
import * as Location from 'expo-location';

interface LocationPermissionPromptProps {
  permissionStatus: Location.PermissionStatus | null;
  onRequestPermission: () => Promise<boolean>;
  error?: string | null;
}

export function LocationPermissionPrompt({
  permissionStatus,
  onRequestPermission,
  error,
}: LocationPermissionPromptProps) {
  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Don't show anything if permission is granted
  if (permissionStatus === Location.PermissionStatus.GRANTED) {
    return null;
  }

  // Permission denied - show settings prompt
  if (permissionStatus === Location.PermissionStatus.DENIED) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.title}>Location Access Needed</Text>
          <Text style={styles.message}>
            To find bathrooms near you, please enable location access in your device settings.
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleOpenSettings}
          >
            <Text style={styles.primaryButtonText}>Open Settings</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Permission not yet requested - show request prompt
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Find Bathrooms Near You</Text>
        <Text style={styles.message}>
          We need your location to show nearby clean bathrooms. Your location is only used while
          you're using the app.
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onRequestPermission}
        >
          <Text style={styles.primaryButtonText}>Allow Location Access</Text>
        </Pressable>
        <Text style={styles.privacyNote}>
          We respect your privacy. Location data is never stored or shared.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  error: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyNote: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
