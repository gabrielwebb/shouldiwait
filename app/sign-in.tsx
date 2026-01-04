import { View, Text, StyleSheet, Pressable, useColorScheme, Platform } from 'react-native';
import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { getBackgroundColor, getTextColor, Yellow, Special } from '@/constants/Colors';
import { useState } from 'react';

// Required for OAuth flow
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        // Navigate to onboarding or main app based on first-time user
        router.replace('/onboarding');
      } else if (signIn?.status === 'complete') {
        await setActive!({ session: signIn.createdSessionId });
        // Returning user - skip onboarding
        router.replace('/');
      } else if (signUp?.status === 'complete') {
        await setActive!({ session: signUp.createdSessionId });
        // New user - show onboarding
        router.replace('/onboarding');
      }
    } catch (err) {
      console.error('OAuth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor(isDark) }]}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🚽</Text>
        <Text style={[styles.heroTitle, { color: getTextColor(isDark) }]}>
          Should I Wait?
        </Text>
        <Text style={[styles.heroSubtitle, { color: getTextColor(isDark, 'secondary') }]}>
          Find clean bathrooms nearby,{'\n'}
          rated by the community
        </Text>
      </View>

      {/* Benefits */}
      <View style={styles.benefits}>
        <BenefitRow
          icon="📍"
          text="Find bathrooms near you"
          isDark={isDark}
        />
        <BenefitRow
          icon="⭐"
          text="See real-time cleanliness ratings"
          isDark={isDark}
        />
        <BenefitRow
          icon="🕐"
          text="Know the best times to visit"
          isDark={isDark}
        />
        <BenefitRow
          icon="🧭"
          text="Get turn-by-turn directions"
          isDark={isDark}
        />
      </View>

      {/* Sign In Buttons */}
      <View style={styles.authButtons}>
        {/* Google Sign In */}
        <Pressable
          style={({ pressed }) => [
            styles.googleButton,
            { backgroundColor: getBackgroundColor(isDark, true) },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={[styles.googleText, { color: getTextColor(isDark) }]}>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </Pressable>

        {/* Email Sign In (Coming Soon) */}
        <Pressable
          style={({ pressed }) => [
            styles.emailButton,
            { backgroundColor: Yellow.primary },
            pressed && { opacity: 0.8 },
          ]}
          disabled={true}
        >
          <Text style={styles.emailIcon}>✉️</Text>
          <Text style={styles.emailText}>Email Sign In (Coming Soon)</Text>
        </Pressable>
      </View>

      {/* Terms */}
      <Text style={[styles.terms, { color: getTextColor(isDark, 'tertiary') }]}>
        By continuing, you agree to our Terms of Service{'\n'}
        and Privacy Policy
      </Text>
    </View>
  );
}

function BenefitRow({ icon, text, isDark }: { icon: string; text: string; isDark: boolean }) {
  return (
    <View style={styles.benefitRow}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={[styles.benefitText, { color: getTextColor(isDark) }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.select({ ios: 80, android: 60, default: 40 }),
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  heroIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefits: {
    marginBottom: 48,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitIcon: {
    fontSize: 28,
    marginRight: 16,
    width: 40,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  authButtons: {
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Yellow.primary,
  },
  googleIcon: {
    fontSize: 24,
    marginRight: 12,
    fontWeight: '700',
  },
  googleText: {
    fontSize: 17,
    fontWeight: '600',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    opacity: 0.5,
  },
  emailIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  emailText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  terms: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
