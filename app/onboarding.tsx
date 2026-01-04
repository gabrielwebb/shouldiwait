import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackgroundColor, getTextColor, Yellow, Special } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_SCREENS = [
  {
    icon: '🗺️',
    title: 'Find Bathrooms Nearby',
    description: 'Use the map or list view to discover clean bathrooms in your area. Filter by distance, amenities, and cleanliness ratings.',
  },
  {
    icon: '⭐',
    title: 'See Real-Time Insights',
    description: 'View cleanliness trends, peak clean times, and community ratings to make informed decisions.',
  },
  {
    icon: '📸',
    title: 'Rate & Review',
    description: 'Help the community by rating bathrooms, leaving reviews, and uploading photos. Your feedback keeps the data fresh.',
  },
  {
    icon: '🧭',
    title: 'Get Directions',
    description: "Tap the navigate button to open turn-by-turn directions in Apple Maps or Google Maps. You'll never be lost again!",
  },
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastScreen = currentIndex === ONBOARDING_SCREENS.length - 1;
  const currentScreen = ONBOARDING_SCREENS[currentIndex];

  const handleNext = () => {
    if (isLastScreen) {
      completeOnboarding();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      router.replace('/');
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      // Navigate anyway
      router.replace('/');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor(isDark) }]}>
      {/* Skip Button */}
      {!isLastScreen && (
        <Pressable
          style={({ pressed }) => [
            styles.skipButton,
            pressed && { opacity: 0.6 },
          ]}
          onPress={handleSkip}
        >
          <Text style={[styles.skipText, { color: getTextColor(isDark, 'secondary') }]}>
            Skip
          </Text>
        </Pressable>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{currentScreen.icon}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: getTextColor(isDark) }]}>
          {currentScreen.title}
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: getTextColor(isDark, 'secondary') }]}>
          {currentScreen.description}
        </Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottom}>
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_SCREENS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? Yellow.primary
                      : getTextColor(isDark, 'tertiary'),
                  opacity: index === currentIndex ? 1 : 0.3,
                },
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            { backgroundColor: Yellow.primary },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {isLastScreen ? "Let's Go! 🚀" : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.select({ ios: 60, android: 40, default: 20 }),
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  icon: {
    fontSize: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: Platform.select({ ios: 40, android: 32, default: 24 }),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
});
