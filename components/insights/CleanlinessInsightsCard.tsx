import { View, Text, StyleSheet, Platform, useColorScheme, ActivityIndicator } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { getTextColor, getBackgroundColor, getBlue } from '@/constants/Colors';
import { TrendBadge } from './TrendBadge';
import { TrendSparkline } from './TrendSparkline';
import { TimeRecommendationCard } from './TimeRecommendationCard';

interface CleanlinessInsightsCardProps {
  locationId: Id<'locations'>;
  compact?: boolean;
}

export function CleanlinessInsightsCard({ locationId, compact = false }: CleanlinessInsightsCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const insight = useQuery(api.insights.getByLocation, { locationId });

  // Loading state
  if (insight === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: getBackgroundColor(isDark, true) }]}>
        <ActivityIndicator size="small" color={getBlue(isDark)} />
      </View>
    );
  }

  // No data state
  if (insight === null || insight.totalRatings === 0) {
    return (
      <View style={[styles.container, { backgroundColor: getBackgroundColor(isDark, true) }]}>
        <Text style={[styles.noDataText, { color: getTextColor(isDark, 'tertiary') }]}>
          📊 Not enough data yet. Be the first to rate!
        </Text>
      </View>
    );
  }

  // Compact view for list items
  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: getBackgroundColor(isDark, true) }]}>
        <View style={styles.compactRow}>
          <Text style={[styles.compactLabel, { color: getTextColor(isDark, 'secondary') }]}>
            Avg: {insight.avgCleanliness.toFixed(1)} ⭐
          </Text>
          {insight.trend && insight.trendPercentage && (
            <TrendBadge trend={insight.trend} percentage={insight.trendPercentage} compact />
          )}
        </View>
        {insight.bestTimeToVisit && (
          <Text style={[styles.compactTime, { color: getTextColor(isDark, 'tertiary') }]}>
            Best: {insight.bestTimeToVisit}
          </Text>
        )}
      </View>
    );
  }

  // Full view
  const bestHourRating = insight.peakCleanHour !== undefined
    ? insight.hourlyAvg.find((h: { hour: number; avgRating: number; count: number }) => h.hour === insight.peakCleanHour)?.avgRating
    : undefined;

  const worstHourRating = insight.peakDirtyHour !== undefined
    ? insight.hourlyAvg.find((h: { hour: number; avgRating: number; count: number }) => h.hour === insight.peakDirtyHour)?.avgRating
    : undefined;

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor(isDark, true) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: getTextColor(isDark) }]}>
          📊 Cleanliness Insights
        </Text>
      </View>

      {/* Overall Rating & Trend */}
      <View style={styles.section}>
        <Text style={[styles.overallRating, { color: getTextColor(isDark) }]}>
          Overall Rating: {insight.avgCleanliness.toFixed(1)} ⭐
        </Text>
        {insight.trend && insight.trendPercentage && (
          <View style={styles.trendBadgeContainer}>
            <TrendBadge trend={insight.trend} percentage={insight.trendPercentage} />
          </View>
        )}
        <Text style={[styles.metaText, { color: getTextColor(isDark, 'tertiary') }]}>
          Based on {insight.totalRatings} {insight.totalRatings === 1 ? 'rating' : 'ratings'}
        </Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: isDark ? '#38383A' : '#E5E5E7' }]} />

      {/* Time Recommendations */}
      <View style={styles.section}>
        <TimeRecommendationCard
          type="best"
          timeRange={insight.bestTimeToVisit}
          avgRating={bestHourRating}
        />
        <TimeRecommendationCard
          type="worst"
          timeRange={insight.worstTimeToAvoid}
          avgRating={worstHourRating}
        />
      </View>

      {/* Trend Chart */}
      {insight.recentHistory && insight.recentHistory.length > 0 && (
        <>
          <View style={[styles.divider, { backgroundColor: isDark ? '#38383A' : '#E5E5E7' }]} />
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: getTextColor(isDark, 'secondary') }]}>
              📈 Last 7 Days
            </Text>
            <View style={styles.chartContainer}>
              <TrendSparkline data={insight.recentHistory} width={280} height={80} />
            </View>
          </View>
        </>
      )}

      {/* Last Updated */}
      <Text style={[styles.updatedText, { color: getTextColor(isDark, 'tertiary') }]}>
        Updated {formatTimeAgo(insight.lastUpdated)}
      </Text>
    </View>
  );
}

// Helper: Format time ago
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return minutes <= 1 ? 'just now' : `${minutes} min ago`;
  }
  if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    padding: 16,
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
  compactContainer: {
    borderRadius: Platform.select({ ios: 12, android: 10 }),
    padding: 12,
    marginTop: 8,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  compactLabel: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    fontWeight: '600',
  },
  compactTime: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: Platform.select({ ios: 20, android: 18 }),
    fontWeight: '700',
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
  },
  section: {
    marginBottom: 12,
  },
  overallRating: {
    fontSize: Platform.select({ ios: 24, android: 22 }),
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
  },
  trendBadgeContainer: {
    marginBottom: 8,
  },
  metaText: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: Platform.select({ ios: 16, android: 15 }),
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: Platform.select({ ios: -0.3, android: 0 }),
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  updatedText: {
    fontSize: Platform.select({ ios: 12, android: 11 }),
    textAlign: 'center',
    marginTop: 8,
  },
  noDataText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    textAlign: 'center',
    padding: 20,
  },
});
