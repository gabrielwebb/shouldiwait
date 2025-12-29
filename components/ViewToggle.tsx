/**
 * ViewToggle Component
 *
 * Toggles between map and list view with a friendly, yellow-accented design.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useColorScheme,
} from 'react-native';

interface ViewToggleProps {
  viewMode: 'map' | 'list';
  onToggle: (mode: 'map' | 'list') => void;
}

export function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const yellowAccent = '#FFD60A'; // iOS yellow
  const yellowDark = '#FFC700';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      {/* Map Button */}
      <Pressable
        style={[
          styles.button,
          viewMode === 'map' && styles.buttonActive,
          viewMode === 'map' && { backgroundColor: yellowAccent },
        ]}
        onPress={() => onToggle('map')}
        accessibilityRole="button"
        accessibilityLabel="Switch to map view"
        accessibilityState={{ selected: viewMode === 'map' }}
      >
        <Text style={[
          styles.emoji,
          viewMode === 'map' && styles.emojiActive
        ]}>
          🗺️
        </Text>
        <Text style={[
          styles.buttonText,
          { color: viewMode === 'map' ? '#000000' : (isDark ? '#8E8E93' : '#8E8E93') },
          viewMode === 'map' && styles.buttonTextActive,
        ]}>
          Map
        </Text>
      </Pressable>

      {/* List Button */}
      <Pressable
        style={[
          styles.button,
          viewMode === 'list' && styles.buttonActive,
          viewMode === 'list' && { backgroundColor: yellowAccent },
        ]}
        onPress={() => onToggle('list')}
        accessibilityRole="button"
        accessibilityLabel="Switch to list view"
        accessibilityState={{ selected: viewMode === 'list' }}
      >
        <Text style={[
          styles.emoji,
          viewMode === 'list' && styles.emojiActive
        ]}>
          📋
        </Text>
        <Text style={[
          styles.buttonText,
          { color: viewMode === 'list' ? '#000000' : (isDark ? '#8E8E93' : '#8E8E93') },
          viewMode === 'list' && styles.buttonTextActive,
        ]}>
          List
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.select({ ios: 10, android: 9 }),
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonActive: {
    // Background set inline with yellow color
  },
  emoji: {
    fontSize: Platform.select({ ios: 18, android: 16 }),
    opacity: 0.6,
  },
  emojiActive: {
    opacity: 1,
  },
  buttonText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '600',
    letterSpacing: Platform.select({ ios: -0.3, android: 0 }),
  },
  buttonTextActive: {
    fontWeight: '700',
  },
});
