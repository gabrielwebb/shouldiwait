import { View, Text, StyleSheet, Platform } from 'react-native';
import { getTextColor } from '@/constants/Colors';

interface TrustBadgeProps {
  badge: string | null;
  trustPercentage: number | null;
  totalRatings: number;
  isDark: boolean;
  compact?: boolean;
}

const BADGE_CONFIG = {
  cleanliness_expert: {
    icon: '🥇',
    label: 'Expert',
    color: '#FFD700',
  },
  trusted_reviewer: {
    icon: '🥈',
    label: 'Trusted',
    color: '#C0C0C0',
  },
  regular_contributor: {
    icon: '🥉',
    label: 'Regular',
    color: '#CD7F32',
  },
  new_reviewer: {
    icon: '🌱',
    label: 'New',
    color: '#34C759',
  },
};

export function TrustBadge({ badge, trustPercentage, totalRatings, isDark, compact = false }: TrustBadgeProps) {
  const badgeInfo = badge ? BADGE_CONFIG[badge as keyof typeof BADGE_CONFIG] : null;

  if (compact) {
    // Compact display for list items
    return (
      <View style={styles.compactContainer}>
        {badgeInfo && (
          <Text style={styles.badgeIcon}>{badgeInfo.icon}</Text>
        )}
        {trustPercentage !== null && (
          <Text style={[styles.trustText, { color: getTextColor(isDark, 'secondary') }]}>
            {trustPercentage}% trusted
          </Text>
        )}
        <Text style={[styles.countText, { color: getTextColor(isDark, 'tertiary') }]}>
          • {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
        </Text>
      </View>
    );
  }

  // Full display for profile/detail screens
  return (
    <View style={styles.fullContainer}>
      {badgeInfo && (
        <View style={[styles.badgeContainer, { borderColor: badgeInfo.color }]}>
          <Text style={styles.badgeIconLarge}>{badgeInfo.icon}</Text>
          <Text style={[styles.badgeLabel, { color: badgeInfo.color }]}>
            {badgeInfo.label}
          </Text>
        </View>
      )}
      {trustPercentage !== null && (
        <View style={styles.trustContainer}>
          <Text style={[styles.trustPercentage, { color: getTextColor(isDark) }]}>
            {trustPercentage}%
          </Text>
          <Text style={[styles.trustLabel, { color: getTextColor(isDark, 'secondary') }]}>
            Trust Score
          </Text>
        </View>
      )}
      <Text style={[styles.totalReviews, { color: getTextColor(isDark, 'tertiary') }]}>
        {totalRatings} total {totalRatings === 1 ? 'review' : 'reviews'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeIcon: {
    fontSize: 14,
  },
  trustText: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    fontWeight: '600',
  },
  countText: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
  },
  fullContainer: {
    alignItems: 'center',
    gap: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
  },
  badgeIconLarge: {
    fontSize: 20,
  },
  badgeLabel: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '700',
  },
  trustContainer: {
    alignItems: 'center',
  },
  trustPercentage: {
    fontSize: Platform.select({ ios: 34, android: 32 }),
    fontWeight: '700',
    letterSpacing: -1,
  },
  trustLabel: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '500',
    marginTop: -4,
  },
  totalReviews: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
  },
});
