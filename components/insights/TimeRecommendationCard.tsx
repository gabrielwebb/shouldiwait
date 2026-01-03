import { View, Text, StyleSheet, Platform, useColorScheme } from 'react-native';
import { getTextColor, getBackgroundColor, Yellow, Special } from '@/constants/Colors';

interface TimeRecommendationCardProps {
  type: 'best' | 'worst';
  timeRange?: string;
  avgRating?: number;
}

export function TimeRecommendationCard({ type, timeRange, avgRating }: TimeRecommendationCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!timeRange) {
    return null;
  }

  const config = {
    best: {
      icon: '✅',
      title: 'Best Time to Visit',
      bgColor: isDark ? 'rgba(255, 214, 10, 0.15)' : Yellow.subtle,
      accentColor: isDark ? Yellow.light : Yellow.primary,
    },
    worst: {
      icon: '⚠️',
      title: 'Avoid These Times',
      bgColor: isDark ? 'rgba(142, 142, 147, 0.15)' : 'rgba(142, 142, 147, 0.1)',
      accentColor: isDark ? '#98989D' : '#8E8E93',
    },
  };

  const { icon, title, bgColor, accentColor } = config[type];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.title, { color: getTextColor(isDark, 'secondary') }]}>
          {title}
        </Text>
      </View>

      <Text style={[styles.timeRange, { color: accentColor }]}>
        {timeRange}
      </Text>

      {avgRating !== undefined && (
        <Text style={[styles.rating, { color: getTextColor(isDark, 'tertiary') }]}>
          Avg rating: {avgRating.toFixed(1)} ⭐
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: Platform.select({ ios: 14, android: 12 }),
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  title: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    fontWeight: '600',
    letterSpacing: Platform.select({ ios: -0.2, android: 0 }),
  },
  timeRange: {
    fontSize: Platform.select({ ios: 20, android: 18 }),
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
  },
  rating: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
  },
});
