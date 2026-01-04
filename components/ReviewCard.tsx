import { View, Text, StyleSheet, Platform, useColorScheme } from 'react-native';
import { getTextColor, getBackgroundColor, getCleanlinessColor } from '@/constants/Colors';
import { TrustBadge } from './TrustBadge';
import { HelpfulVoting } from './HelpfulVoting';
import { Id } from '@/convex/_generated/dataModel';

interface ReviewCardProps {
  ratingId: Id<'ratings'>;
  cleanliness: number;
  review?: string;
  timestamp: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  authorTrustPercentage: number | null;
  authorBadge: string | null;
  authorTotalRatings: number;
}

export function ReviewCard({
  ratingId,
  cleanliness,
  review,
  timestamp,
  helpfulVotes,
  notHelpfulVotes,
  authorTrustPercentage,
  authorBadge,
  authorTotalRatings,
}: ReviewCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cleanlinessColor = getCleanlinessColor(cleanliness);
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getCleanlinessLabel = (rating: number): string => {
    if (rating >= 4.5) return 'Spotless';
    if (rating >= 4.0) return 'Very Clean';
    if (rating >= 3.5) return 'Clean';
    if (rating >= 3.0) return 'Acceptable';
    if (rating >= 2.0) return 'Needs Work';
    return 'Poor';
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor(isDark, true) }]}>
      {/* Header: Rating + Trust Badge */}
      <View style={styles.header}>
        <View style={styles.ratingContainer}>
          <View style={[styles.ratingBadge, { backgroundColor: cleanlinessColor }]}>
            <Text style={styles.ratingNumber}>{cleanliness.toFixed(1)}</Text>
          </View>
          <View style={styles.ratingLabels}>
            <Text style={[styles.ratingLabel, { color: getTextColor(isDark) }]}>
              {getCleanlinessLabel(cleanliness)}
            </Text>
            <Text style={[styles.dateText, { color: getTextColor(isDark, 'tertiary') }]}>
              {formattedDate}
            </Text>
          </View>
        </View>
      </View>

      {/* Review Text */}
      {review && (
        <Text style={[styles.reviewText, { color: getTextColor(isDark, 'secondary') }]}>
          {review}
        </Text>
      )}

      {/* Author Trust Info */}
      <View style={styles.authorInfo}>
        <TrustBadge
          badge={authorBadge}
          trustPercentage={authorTrustPercentage}
          totalRatings={authorTotalRatings}
          isDark={isDark}
          compact
        />
      </View>

      {/* Helpful Voting */}
      <HelpfulVoting
        ratingId={ratingId}
        helpfulVotes={helpfulVotes}
        notHelpfulVotes={notHelpfulVotes}
        compact
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    padding: 16,
    gap: 12,
    marginBottom: 12,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: Platform.select({ ios: 18, android: 17 }),
    fontWeight: '700',
    color: '#FFF',
  },
  ratingLabels: {
    gap: 2,
  },
  ratingLabel: {
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: '600',
  },
  dateText: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
  },
  reviewText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    lineHeight: Platform.select({ ios: 22, android: 20 }),
  },
  authorInfo: {
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
