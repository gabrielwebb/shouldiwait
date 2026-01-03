import { View, Text, StyleSheet, Platform, useColorScheme } from 'react-native';
import { getTextColor, Special } from '@/constants/Colors';

interface TrendBadgeProps {
  trend: 'improving' | 'declining' | 'stable';
  percentage?: number;
  compact?: boolean;
}

export function TrendBadge({ trend, percentage, compact = false }: TrendBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const config = {
    improving: {
      emoji: '📈',
      label: 'Improving',
      bgColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
      textColor: isDark ? '#34D399' : '#10B981',
    },
    declining: {
      emoji: '📉',
      label: 'Declining',
      bgColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
      textColor: isDark ? '#F87171' : '#EF4444',
    },
    stable: {
      emoji: '➡️',
      label: 'Stable',
      bgColor: isDark ? 'rgba(142, 142, 147, 0.2)' : 'rgba(142, 142, 147, 0.15)',
      textColor: isDark ? '#98989D' : '#8E8E93',
    },
  };

  const { emoji, label, bgColor, textColor } = config[trend];
  const showPercentage = percentage !== undefined && trend !== 'stable';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: textColor }]}>
        {label}
        {showPercentage && (
          <Text style={styles.percentage}>
            {' '}
            {percentage > 0 ? '+' : ''}
            {percentage.toFixed(1)}%
          </Text>
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  emoji: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    marginRight: 4,
  },
  label: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    fontWeight: '600',
    letterSpacing: Platform.select({ ios: -0.2, android: 0 }),
  },
  percentage: {
    fontWeight: '700',
  },
});
