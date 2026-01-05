import { View, Text, StyleSheet, ScrollView, Platform, useColorScheme, Pressable, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { getTextColor, getBackgroundColor, getBlue, Yellow } from '@/constants/Colors';
import { CleanlinessInsightsCard } from '@/components/insights/CleanlinessInsightsCard';
import { ReviewCard } from '@/components/ReviewCard';
import { useState, useEffect } from 'react';

export default function BathroomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [hasLoadingTimedOut, setHasLoadingTimedOut] = useState(false);
  const [hasLocationTimedOut, setHasLocationTimedOut] = useState(false);

  const locationId = id as Id<'locations'>;

  // Fetch location details from Convex
  const location = useQuery(api.locations.getById, { id: locationId });

  // Fetch cleanliness insights
  const insights = useQuery(api.insights.getByLocation, { locationId });

  // Fetch reviews with trust scores
  const reviews = useQuery(api.reputation.getRatingsWithTrust, { locationId });

  // Detect if review query has been loading too long (likely an error)
  useEffect(() => {
    if (reviews === undefined) {
      const timeout = setTimeout(() => {
        setHasLoadingTimedOut(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    } else {
      setHasLoadingTimedOut(false);
    }
  }, [reviews]);

  // Detect if location query has been loading too long
  useEffect(() => {
    if (location === undefined) {
      const timeout = setTimeout(() => {
        setHasLocationTimedOut(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    } else {
      setHasLocationTimedOut(false);
    }
  }, [location]);

  const handleNavigate = () => {
    if (!location) return;

    const label = encodeURIComponent(location.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${location.latitude},${location.longitude}`,
      android: `geo:0,0?q=${location.latitude},${location.longitude}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColor(isDark) }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: getBackgroundColor(isDark, true) },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>

          <View style={styles.titleContainer}>
            {location === undefined && hasLocationTimedOut ? (
              <Text style={[styles.title, { color: getTextColor(isDark) }]}>
                Error Loading Location
              </Text>
            ) : location === undefined ? (
              <Text style={[styles.title, { color: getTextColor(isDark) }]}>
                Loading...
              </Text>
            ) : location ? (
              <>
                <Text style={[styles.title, { color: getTextColor(isDark) }]}>
                  {location.name}
                </Text>
                <Text style={[styles.address, { color: getTextColor(isDark, 'secondary') }]}>
                  {location.address}
                </Text>
              </>
            ) : (
              <Text style={[styles.title, { color: getTextColor(isDark) }]}>
                Location Not Found
              </Text>
            )}
          </View>
        </View>

        {/* Navigate Button */}
        {location && (
          <Pressable
            onPress={handleNavigate}
            style={({ pressed }) => [
              styles.navigateButton,
              { backgroundColor: Yellow.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.navigateIcon}>🧭</Text>
            <Text style={styles.navigateText}>Get Directions</Text>
          </Pressable>
        )}

        {/* Cleanliness Insights Card */}
        {insights && (
          <View style={styles.insightsContainer}>
            <CleanlinessInsightsCard locationId={locationId} />
          </View>
        )}

        {/* Amenities Section */}
        {location && location.amenities && location.amenities.length > 0 && (
          <View style={[styles.section, { backgroundColor: getBackgroundColor(isDark, true) }]}>
            <Text style={[styles.sectionTitle, { color: getTextColor(isDark) }]}>
              Amenities
            </Text>
            <View style={styles.amenitiesList}>
              {location.amenities.map((amenity, index) => (
                <Text key={index} style={[styles.amenityItem, { color: getTextColor(isDark, 'secondary') }]}>
                  • {amenity}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Recent Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={[styles.sectionTitle, { color: getTextColor(isDark) }]}>
            Recent Reviews
          </Text>
          {reviews === undefined && hasLoadingTimedOut ? (
            <View style={[styles.errorState, { backgroundColor: getBackgroundColor(isDark, true) }]}>
              <Text style={[styles.errorText, { color: getTextColor(isDark) }]}>
                Unable to load reviews. Please check your connection and try again.
              </Text>
              <Pressable
                onPress={() => {
                  setHasLoadingTimedOut(false);
                  router.replace(`/bathroom/${id}`);
                }}
                style={({ pressed }) => [
                  styles.retryButton,
                  { backgroundColor: getBlue(isDark) },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : reviews === undefined ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={getBlue(isDark)} />
              <Text style={[styles.loadingText, { color: getTextColor(isDark, 'tertiary') }]}>
                Loading reviews...
              </Text>
            </View>
          ) : reviews.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: getBackgroundColor(isDark, true) }]}>
              <Text style={[styles.emptyStateText, { color: getTextColor(isDark, 'tertiary') }]}>
                No reviews yet. Be the first to rate this bathroom!
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review._id}
                ratingId={review._id}
                cleanliness={review.cleanliness}
                review={review.review}
                timestamp={review.timestamp}
                helpfulVotes={review.helpfulVotes}
                notHelpfulVotes={review.notHelpfulVotes}
                authorTrustPercentage={review.authorTrustPercentage}
                authorBadge={review.authorBadge}
                authorTotalRatings={review.authorTotalRatings}
              />
            ))
          )}
        </View>
      </ScrollView>

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  backIcon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: Platform.select({ ios: 28, android: 24 }),
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
  },
  address: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: Platform.select({ ios: 14, android: 12 }),
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  navigateIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  navigateText: {
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: '700',
    color: '#000',
    letterSpacing: Platform.select({ ios: -0.3, android: 0 }),
  },
  insightsContainer: {
    marginBottom: 20,
  },
  section: {
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    padding: 16,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: Platform.select({ ios: 20, android: 18 }),
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
  },
  amenitiesList: {
    gap: 8,
  },
  amenityItem: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    marginBottom: 4,
  },
  reviewsSection: {
    gap: 12,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    textAlign: 'center',
  },
  errorState: {
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    padding: 24,
    alignItems: 'center',
    gap: 16,
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
  errorText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Platform.select({ ios: 12, android: 8 }),
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: Platform.select({ ios: 16, android: 14 }),
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    padding: 24,
    alignItems: 'center',
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
  emptyStateText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
