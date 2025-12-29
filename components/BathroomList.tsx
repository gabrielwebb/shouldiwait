/**
 * BathroomList Component
 *
 * Scrollable list view of bathrooms.
 * Features pull-to-refresh, empty state, and iOS-native styling.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Platform,
  useColorScheme,
} from 'react-native';
import { BathroomListItem } from './BathroomListItem';
import { BathroomLocation } from '@/types';
import { getTextColor, getBlue } from '@/constants/Colors';

interface BathroomListProps {
  bathrooms: BathroomLocation[];
  onRefresh?: () => void;
  onBathroomPress?: (bathroom: BathroomLocation) => void;
  refreshing?: boolean;
}

export function BathroomList({
  bathrooms,
  onRefresh,
  onBathroomPress,
  refreshing = false,
}: BathroomListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Empty state when no bathrooms found
  if (!refreshing && bathrooms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🚻</Text>
        <Text style={[styles.emptyTitle, { color: getTextColor(isDark) }]}>
          No Bathrooms Found
        </Text>
        <Text style={[styles.emptyText, { color: getTextColor(isDark, 'tertiary') }]}>
          Try zooming out on the map or adjusting your location.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bathrooms}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <BathroomListItem bathroom={item} onPress={onBathroomPress} />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={true}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={getBlue(isDark)}
            title="Pull to refresh"
            titleColor={getTextColor(isDark, 'tertiary')}
          />
        ) : undefined
      }
      ListHeaderComponent={
        bathrooms.length > 0 ? (
          <View style={styles.headerContainer}>
            <Text
              style={[styles.headerText, { color: getTextColor(isDark, 'tertiary') }]}
              accessible={true}
              accessibilityRole="header"
            >
              {bathrooms.length} {bathrooms.length === 1 ? 'bathroom' : 'bathrooms'} nearby •
              Sorted by distance
            </Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        bathrooms.length > 0 ? (
          <View style={styles.footerContainer}>
            <Text
              style={[styles.footerText, { color: getTextColor(isDark, 'tertiary') }]}
            >
              That's all the bathrooms within 5 miles
            </Text>
          </View>
        ) : null
      }
      accessible={true}
      accessibilityLabel="List of nearby bathrooms"
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },

  // Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerText: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Footer
  footerContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    fontStyle: 'italic',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: Platform.select({ ios: 20, android: 18 }),
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
  },
  emptyText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    textAlign: 'center',
    lineHeight: 22,
  },
});
