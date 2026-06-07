// Ported from Flutter: lib/screens/profile/profile_screen.dart (ProfileScreen)
import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { showSnack } from '@/lib/snack';

import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import { ProfileMenuItem } from '@/components/cards';
import { useAuthStore } from '@/store/authStore';

// Mirrors AppColors.x.withOpacity(o) -> 8-digit hex.
function hexWithOpacity(hex: string, opacity: number): string {
  const a = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

export default function ProfileScreen() {
  const router = useRouter();

  // final AuthController authController = Get.find();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Guests may only use Settings; the rest of the menu requires an account.
  const guestDisabled = !isLoggedIn;

  return (
    <View style={styles.scaffold}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          {/* Profile Header Section
              Flutter LinearGradient(topCenter->bottomCenter:
                primaryColor.withOpacity(0.1) -> backgroundColor).
              expo-linear-gradient not available; approximate with a plain
              View tinted with the top gradient color (primary @ 0.1). */}
          <View style={styles.headerGradient}>
            <SafeAreaView edges={['top']}>
              <View style={styles.headerPadding}>
                {/* User Name */}
                <BaseText
                  title={user?.name ?? 'Guest'}
                  style={styles.userName}
                />
                <View style={{ height: h(8) }} />

                {/* Membership Badge */}
                <View style={styles.membershipBadge}>
                  <MaterialIcons
                    name="workspace-premium"
                    size={sp(16)}
                    color={AppColors.lightOrange}
                  />
                  <View style={{ width: w(6) }} />
                  <BaseText
                    title={t('gold_member')}
                    style={styles.membershipText}
                  />
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={{ height: h(20) }} />

          {/* Menu Items */}
          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="person-outline"
              title={t('personal_info')}
              disabled={guestDisabled}
              onPress={() => router.push('/personal-info')}
            />
            <ProfileMenuItem
              icon="location-outline"
              title={t('saved_addresses')}
              disabled={guestDisabled}
              onPress={() => router.push('/saved-addresses')}
            />
            <ProfileMenuItem
              icon="heart-outline"
              title={t('favorites')}
              disabled={guestDisabled}
              onPress={() => showSnack(t('coming_soon'), 'info')}
            />
            <ProfileMenuItem
              icon="settings-outline"
              title={t('settings')}
              onPress={() => router.push('/settings')}
            />
            <ProfileMenuItem
              icon="notifications-outline"
              title={t('notifications')}
              disabled={guestDisabled}
              onPress={() => {
                // Get.find<NavigationController>().navigateInTab(Routes.notification);
                router.push('/notifications');
              }}
            />
            <ProfileMenuItem
              icon="shield-outline"
              title={t('privacy_policy')}
              onPress={() => {
                // Get.find<NavigationController>().navigateInTab(Routes.privacyPolice);
                router.push('/privacy-policy');
              }}
            />
            <ProfileMenuItem
              icon="headset-outline"
              title={t('support_report')}
              onPress={() => {
                // Get.find<NavigationController>().navigateInTab(Routes.supportReport);
                router.push('/support-report' as any);
              }}
            />
            <ProfileMenuItem
              icon="help-circle-outline"
              title={t('help_support')}
              onPress={() => router.push('/help-support' as any)}
            />
          </View>

          <View style={{ height: h(20) }} />

          {/* Sign Out Button — guests have no session to end, so hide it. */}
          {isLoggedIn && (
            <Pressable
              onPress={async () => {
                // await authController.logoutFromCurrentToken();
                // Get.find<NavigationController>().logout();
                await useAuthStore.getState().logout();
                router.replace('/login');
              }}
            >
              <View style={styles.signOutCard}>
                <Ionicons
                  name="log-out-outline"
                  color={AppColors.secondMainColor}
                  size={sp(22)}
                />
                <View style={{ width: w(12) }} />
                <BaseText title={t('sign_out')} style={styles.signOutText} />
              </View>
            </Pressable>
          )}

          <View style={{ height: h(30) }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scaffold: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  headerGradient: {
    width: '100%',
    backgroundColor: hexWithOpacity(AppColors.primaryColor, 0.1),
  },
  headerPadding: {
    paddingVertical: h(30),
    alignItems: 'center',
  },
  userName: {
    fontSize: sp(20),
    fontFamily: quicksand('bold'),
    color: AppColors.textColorTheme,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: w(12),
    paddingVertical: h(6),
    backgroundColor: hexWithOpacity(AppColors.lightOrange, 0.2),
    borderRadius: r(20),
  },
  membershipText: {
    fontSize: sp(13),
    fontFamily: quicksand('600'),
    color: AppColors.textColorTheme,
  },
  menuCard: {
    marginHorizontal: w(16),
    backgroundColor: AppColors.white,
    borderRadius: r(16),
    overflow: 'hidden',
    shadowColor: hexWithOpacity(AppColors.black, 0.05),
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 2,
  },
  signOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: w(16),
    paddingVertical: h(16),
    backgroundColor: AppColors.white,
    borderRadius: r(16),
    shadowColor: hexWithOpacity(AppColors.black, 0.05),
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 2,
  },
  signOutText: {
    fontSize: sp(15),
    fontFamily: quicksand('600'),
    color: AppColors.secondMainColor,
  },
});
