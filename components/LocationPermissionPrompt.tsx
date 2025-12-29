import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Linking, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { getBackgroundColor, getTextColor, getBlue, Special } from '@/constants/Colors';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
      <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColor(isDark) }]}>
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: getBackgroundColor(isDark, true) }]}>
            <Text style={styles.icon} accessibilityLabel="Location icon">📍</Text>
            <Text
              style={[styles.title, { color: getTextColor(isDark) }]}
              accessible={true}
              accessibilityRole="header"
            >
              Location Access Needed
            </Text>
            <Text style={[styles.message, { color: getTextColor(isDark, 'secondary') }]}>
              To find bathrooms near you, please enable location access in your device settings.
            </Text>
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: isDark ? Special.errorBackground.dark : Special.errorBackground.light }]}>
                <Text style={[styles.error, { color: isDark ? '#FF6B6B' : '#DC2626' }]}>{error}</Text>
              </View>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
                isDark && styles.darkButton,
              ]}
              onPress={handleOpenSettings}
              accessible={true}
              accessibilityLabel="Open Settings"
              accessibilityHint="Opens your device settings to enable location access"
              accessibilityRole="button"
            >
              <Text style={[styles.primaryButtonText, isDark && { color: '#FFFFFF' }]}>
                Open Settings
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Permission not yet requested - show request prompt
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColor(isDark) }]}>
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: getBackgroundColor(isDark, true) }]}>
          <Text style={styles.icon} accessibilityLabel="Location icon">📍</Text>
          <Text
            style={[styles.title, { color: getTextColor(isDark) }]}
            accessible={true}
            accessibilityRole="header"
          >
            Find Clean Bathrooms Nearby
          </Text>
          <Text style={[styles.message, { color: getTextColor(isDark, 'secondary') }]}>
            We'll use your location to show the cleanest bathrooms around you. Your location is only
            used while you're using the app.
          </Text>
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: isDark ? Special.errorBackground.dark : Special.errorBackground.light }]}>
              <Text style={[styles.error, { color: isDark ? '#FF6B6B' : '#DC2626' }]}>{error}</Text>
            </View>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
              isDark && styles.darkButton,
            ]}
            onPress={onRequestPermission}
            accessible={true}
            accessibilityLabel="Enable location services"
            accessibilityHint="Allows the app to show nearby bathrooms"
            accessibilityRole="button"
          >
            <Text style={[styles.primaryButtonText, isDark && { color: '#FFFFFF' }]}>
              Enable Location
            </Text>
          </Pressable>
          <Text style={[styles.privacyNote, { color: getTextColor(isDark, 'tertiary') }]}>
            🔒 We respect your privacy. Location data is never stored or shared.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: Platform.select({ ios: 20, android: 16 }),
    padding: Platform.select({ ios: 32, android: 24 }),
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  icon: {
    fontSize: 72,
    marginBottom: 20,
  },
  title: {
    fontSize: Platform.select({ ios: 28, android: 24 }),
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
  },
  message: {
    fontSize: Platform.select({ ios: 17, android: 16 }),
    textAlign: 'center',
    lineHeight: Platform.select({ ios: 22, android: 24 }),
    marginBottom: 28,
  },
  errorContainer: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    paddingVertical: Platform.select({ ios: 16, android: 14 }),
    paddingHorizontal: 32,
    borderRadius: Platform.select({ ios: 12, android: 8 }),
    minWidth: 240,
    minHeight: 50, // iOS minimum tap target
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF', // iOS system blue (light mode)
  },
  darkButton: {
    backgroundColor: '#0A84FF', // iOS system blue (dark mode)
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: '600',
    letterSpacing: Platform.select({ ios: -0.4, android: 0 }),
  },
  privacyNote: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
