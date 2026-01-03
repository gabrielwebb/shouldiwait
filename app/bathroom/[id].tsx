import { View, Text, StyleSheet, ScrollView, Platform, useColorScheme, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { getTextColor, getBackgroundColor, getBlue, Yellow } from '@/constants/Colors';
import { CleanlinessInsightsCard } from '@/components/insights/CleanlinessInsightsCard';

export default function BathroomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // In a real app, this would fetch the location from Convex
  // For now, we'll show a placeholder with the insights card
  const locationId = id as Id<'locations'>;

  const handleNavigate = () => {
    // In real implementation, would get actual coordinates
    const label = 'Bathroom Location';
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@37.7749,-122.4194`,
      android: `geo:0,0?q=37.7749,-122.4194(${label})`,
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
            <Text style={[styles.title, { color: getTextColor(isDark) }]}>
              Bathroom Details
            </Text>
            <Text style={[styles.address, { color: getTextColor(isDark, 'secondary') }]}>
              123 Sample St, San Francisco, CA
            </Text>
          </View>
        </View>

        {/* Navigate Button */}
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

        {/* Cleanliness Insights Card */}
        <View style={styles.insightsContainer}>
          <CleanlinessInsightsCard locationId={locationId} />
        </View>

        {/* Amenities Section */}
        <View style={[styles.section, { backgroundColor: getBackgroundColor(isDark, true) }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor(isDark) }]}>
            Amenities
          </Text>
          <View style={styles.amenitiesList}>
            <Text style={[styles.amenityItem, { color: getTextColor(isDark, 'secondary') }]}>
              ♿ Wheelchair Accessible
            </Text>
            <Text style={[styles.amenityItem, { color: getTextColor(isDark, 'secondary') }]}>
              👶 Baby Changing Station
            </Text>
            <Text style={[styles.amenityItem, { color: getTextColor(isDark, 'secondary') }]}>
              🚻 Gender Neutral
            </Text>
          </View>
        </View>

        {/* Recent Reviews Section */}
        <View style={[styles.section, { backgroundColor: getBackgroundColor(isDark, true) }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor(isDark) }]}>
            Recent Reviews
          </Text>
          <Text style={[styles.comingSoon, { color: getTextColor(isDark, 'tertiary') }]}>
            Reviews coming soon...
          </Text>
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
  comingSoon: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontStyle: 'italic',
  },
});
