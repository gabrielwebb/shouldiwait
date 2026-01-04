/**
 * AuthWrapper - Handles authentication state and routing
 *
 * Flow:
 * 1. Check if user is signed in (Clerk)
 * 2. If signed out -> Show sign-in screen
 * 3. If signed in -> Check if onboarding completed
 * 4. If not completed -> Show onboarding
 * 5. If completed -> Show main app
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasCompletedOnboarding(false);
      }
    };

    checkOnboarding();
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || hasCompletedOnboarding === null) return;

    const inAuthGroup = segments[0] === 'sign-in';
    const inOnboardingGroup = segments[0] === 'onboarding';

    // User is signed out
    if (!isSignedIn) {
      if (!inAuthGroup) {
        router.replace('/sign-in');
      }
      return;
    }

    // User is signed in but hasn't completed onboarding
    if (isSignedIn && !hasCompletedOnboarding) {
      if (!inOnboardingGroup) {
        router.replace('/onboarding');
      }
      return;
    }

    // User is signed in and has completed onboarding
    if (isSignedIn && hasCompletedOnboarding) {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace('/');
      }
    }
  }, [isLoaded, isSignedIn, hasCompletedOnboarding, segments]);

  // Show loading while checking auth state
  if (!isLoaded || hasCompletedOnboarding === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD60A" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
