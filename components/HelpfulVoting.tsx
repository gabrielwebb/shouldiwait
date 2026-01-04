import { View, Text, StyleSheet, Pressable, Platform, useColorScheme } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { getTextColor, getBackgroundColor, Yellow, Cleanliness } from '@/constants/Colors';
import { useState } from 'react';

interface HelpfulVotingProps {
  ratingId: Id<'ratings'>;
  helpfulVotes: number;
  notHelpfulVotes: number;
  compact?: boolean;
}

export function HelpfulVoting({ ratingId, helpfulVotes, notHelpfulVotes, compact = false }: HelpfulVotingProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isVoting, setIsVoting] = useState(false);

  const voteOnReview = useMutation(api.reputation.voteOnReview);
  const userVote = useQuery(api.reputation.getUserVoteForRating, { ratingId });

  const totalVotes = helpfulVotes + notHelpfulVotes;
  const helpfulPercentage = totalVotes > 0 ? Math.round((helpfulVotes / totalVotes) * 100) : 0;

  const handleVote = async (isHelpful: boolean) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await voteOnReview({ ratingId, isHelpful });
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={[styles.compactLabel, { color: getTextColor(isDark, 'tertiary') }]}>
          Was this helpful?
        </Text>
        <View style={styles.compactButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.compactButton,
              { backgroundColor: getBackgroundColor(isDark, true) },
              userVote === true && { backgroundColor: Cleanliness.excellent },
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => handleVote(true)}
            disabled={isVoting}
          >
            <Text style={styles.voteIcon}>👍</Text>
            {helpfulVotes > 0 && (
              <Text
                style={[
                  styles.voteCount,
                  { color: userVote === true ? '#FFF' : getTextColor(isDark, 'secondary') },
                ]}
              >
                {helpfulVotes}
              </Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.compactButton,
              { backgroundColor: getBackgroundColor(isDark, true) },
              userVote === false && { backgroundColor: Cleanliness.poor },
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => handleVote(false)}
            disabled={isVoting}
          >
            <Text style={styles.voteIcon}>👎</Text>
            {notHelpfulVotes > 0 && (
              <Text
                style={[
                  styles.voteCount,
                  { color: userVote === false ? '#FFF' : getTextColor(isDark, 'secondary') },
                ]}
              >
                {notHelpfulVotes}
              </Text>
            )}
          </Pressable>
        </View>
        {totalVotes >= 5 && (
          <Text style={[styles.percentage, { color: getTextColor(isDark, 'tertiary') }]}>
            {helpfulPercentage}% helpful
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor(isDark, true) }]}>
      <Text style={[styles.label, { color: getTextColor(isDark, 'secondary') }]}>
        Was this review helpful?
      </Text>
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: getBackgroundColor(isDark) },
            userVote === true && { backgroundColor: Cleanliness.excellent, borderColor: Cleanliness.excellent },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => handleVote(true)}
          disabled={isVoting}
        >
          <Text style={styles.buttonIcon}>👍</Text>
          <Text
            style={[
              styles.buttonText,
              { color: userVote === true ? '#FFF' : getTextColor(isDark) },
            ]}
          >
            Yes
          </Text>
          {helpfulVotes > 0 && (
            <Text
              style={[
                styles.buttonCount,
                { color: userVote === true ? '#FFF' : getTextColor(isDark, 'tertiary') },
              ]}
            >
              ({helpfulVotes})
            </Text>
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: getBackgroundColor(isDark) },
            userVote === false && { backgroundColor: Cleanliness.poor, borderColor: Cleanliness.poor },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => handleVote(false)}
          disabled={isVoting}
        >
          <Text style={styles.buttonIcon}>👎</Text>
          <Text
            style={[
              styles.buttonText,
              { color: userVote === false ? '#FFF' : getTextColor(isDark) },
            ]}
          >
            No
          </Text>
          {notHelpfulVotes > 0 && (
            <Text
              style={[
                styles.buttonCount,
                { color: userVote === false ? '#FFF' : getTextColor(isDark, 'tertiary') },
              ]}
            >
              ({notHelpfulVotes})
            </Text>
          )}
        </Pressable>
      </View>
      {totalVotes >= 5 && (
        <Text style={[styles.stats, { color: getTextColor(isDark, 'tertiary') }]}>
          {helpfulVotes} of {totalVotes} found this helpful ({helpfulPercentage}%)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  label: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonText: {
    fontSize: Platform.select({ ios: 16, android: 15 }),
    fontWeight: '600',
  },
  buttonCount: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
  },
  stats: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    textAlign: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  compactLabel: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
  },
  compactButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  voteIcon: {
    fontSize: 14,
  },
  voteCount: {
    fontSize: Platform.select({ ios: 12, android: 11 }),
    fontWeight: '600',
  },
  percentage: {
    fontSize: Platform.select({ ios: 12, android: 11 }),
  },
});
