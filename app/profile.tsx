import { View, Text, StyleSheet, Pressable, useColorScheme, Platform, ScrollView, Alert } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackgroundColor, getTextColor, Yellow, Special, Gray } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/sign-in');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again next time you open the app.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'default',
          onPress: async () => {
            await AsyncStorage.removeItem('hasCompletedOnboarding');
            Alert.alert('Success', 'Onboarding has been reset. Restart the app to see it again.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColor(isDark) }]} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backText, { color: getTextColor(isDark) }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: getTextColor(isDark) }]}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={[styles.userCard, { backgroundColor: getBackgroundColor(isDark, true) }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0) || '?'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: getTextColor(isDark) }]}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: getTextColor(isDark, 'secondary') }]}>
              {user?.emailAddresses[0]?.emailAddress || 'No email'}
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: getTextColor(isDark, 'secondary') }]}>
            YOUR ACTIVITY
          </Text>
          <View style={[styles.statsGrid, { backgroundColor: getBackgroundColor(isDark, true) }]}>
            <StatItem label="Ratings" value="0" isDark={isDark} />
            <StatItem label="Reviews" value="0" isDark={isDark} />
            <StatItem label="Photos" value="0" isDark={isDark} />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: getTextColor(isDark, 'secondary') }]}>
            SETTINGS
          </Text>

          {/* Account Settings */}
          <SettingItem
            icon="👤"
            label="Account Settings"
            onPress={() => {
              // TODO: Navigate to account settings
              Alert.alert('Coming Soon', 'Account settings will be available soon.');
            }}
            isDark={isDark}
          />

          {/* Notifications */}
          <SettingItem
            icon="🔔"
            label="Notifications"
            onPress={() => {
              // TODO: Navigate to notifications
              Alert.alert('Coming Soon', 'Notification settings will be available soon.');
            }}
            isDark={isDark}
          />

          {/* Privacy */}
          <SettingItem
            icon="🔒"
            label="Privacy"
            onPress={() => {
              // TODO: Navigate to privacy
              Alert.alert('Coming Soon', 'Privacy settings will be available soon.');
            }}
            isDark={isDark}
          />

          {/* Reset Onboarding */}
          <SettingItem
            icon="🔄"
            label="Reset Onboarding"
            onPress={handleResetOnboarding}
            isDark={isDark}
          />

          {/* About */}
          <SettingItem
            icon="ℹ️"
            label="About"
            onPress={() => {
              Alert.alert(
                'Should I Wait?',
                'Version 1.0.0\n\nFind clean bathrooms nearby, rated by the community.\n\nBuilt with Expo, Convex, and Clerk.',
                [{ text: 'OK' }]
              );
            }}
            isDark={isDark}
          />
        </View>

        {/* Sign Out Button */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            { backgroundColor: Special.destructive },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: Yellow.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: getTextColor(isDark, 'secondary') }]}>
        {label}
      </Text>
    </View>
  );
}

function SettingItem({
  icon,
  label,
  onPress,
  isDark,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        { backgroundColor: getBackgroundColor(isDark, true) },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, { color: getTextColor(isDark) }]}>{label}</Text>
      <Text style={[styles.settingChevron, { color: getTextColor(isDark, 'tertiary') }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 20, default: 10 }),
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backText: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  userCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Yellow.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  statsGrid: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingItem: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  settingChevron: {
    fontSize: 24,
    fontWeight: '600',
  },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
