// Ported from Flutter: lib/screens/profile/profile_screen.dart (ProfileScreen)
import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { showSnack } from '@/lib/snack';

import { AppColors, w, h, r, sp } from '@/theme';
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
                {/* Profile Picture */}
                <View style={styles.avatarStack}>
                  <View style={styles.avatarCircle}>
                    {/* Person-icon fallback (shown when no profile image). */}
                    <View style={styles.avatarFallback}>
                      <Ionicons
                        name="person"
                        size={sp(50)}
                        color={AppColors.textColor2}
                      />
                    </View>
                    {!!(user as any)?.profile_image && (
                      <Image
                        source={{ uri: (user as any).profile_image }}
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                  <View style={styles.cameraBadge}>
                    <MaterialIcons
                      name="camera-alt"
                      size={sp(16)}
                      color={AppColors.white}
                    />
                  </View>
                </View>
                <View style={{ height: h(16) }} />

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
                <View style={{ height: h(20) }} />

                {/* Edit Profile Button */}
                <Pressable style={styles.editButton} onPress={() => router.push('/edit-profile')}>
                  <BaseText
                    title={t('edit_profile')}
                    style={styles.editButtonText}
                  />
                </Pressable>
              </View>
            </SafeAreaView>
          </View>

          <View style={{ height: h(20) }} />

          {/* Menu Items */}
          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="person-outline"
              title={t('personal_info')}
              onPress={() => router.push('/edit-profile')}
            />
            <ProfileMenuItem
              icon="location-outline"
              title={t('saved_addresses')}
              onPress={() => router.push('/choose-location')}
            />
            <ProfileMenuItem
              icon="card-outline"
              title={t('payment_methods')}
              onPress={() => showSnack(t('cash_on_delivery'), 'info')}
            />
            <ProfileMenuItem
              icon="heart-outline"
              title={t('favorites')}
              onPress={() => showSnack(t('coming_soon'), 'info')}
            />
            <ProfileMenuItem
              icon="notifications-outline"
              title={t('notifications')}
              onPress={() => {
                // Get.find<NavigationController>().navigateInTab(Routes.notification);
                router.push('/notifications');
              }}
            />
            <ProfileMenuItem
              icon="lock-closed-outline"
              title={t('change_password')}
              onPress={() => {
                // Get.find<NavigationController>().navigateInTab(Routes.changePassword);
                router.push('/change-password');
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
              icon="information-circle-outline"
              title={t('about_us')}
              onPress={() => {
                // Get.find<NavigationController>().navigateInTab(Routes.aboutUs);
                router.push('/about-us');
              }}
            />
            <ProfileMenuItem
              icon="mail-outline"
              title={t('contact_us')}
              onPress={() => {
                // Get.find<NavigationController>().navigateInTab(Routes.contentUs);
                router.push('/contact-us');
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
          </View>

          <View style={{ height: h(20) }} />

          {/* Sign Out Button */}
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
  avatarStack: {
    width: w(100),
    height: w(100),
  },
  avatarCircle: {
    width: w(100),
    height: w(100),
    borderRadius: w(50),
    borderWidth: 3,
    borderColor: AppColors.white,
    overflow: 'hidden',
    backgroundColor: AppColors.lightGreyV2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: hexWithOpacity(AppColors.black, 0.1),
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 4,
  },
  avatarFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: w(32),
    height: w(32),
    borderRadius: w(16),
    backgroundColor: AppColors.primaryColor,
    borderWidth: 2,
    borderColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: sp(20),
    fontWeight: 'bold',
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
    fontWeight: '600',
    color: AppColors.textColorTheme,
  },
  editButton: {
    minWidth: w(180),
    height: h(48),
    paddingHorizontal: w(20),
    borderRadius: r(24),
    backgroundColor: AppColors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: sp(15),
    fontWeight: 'bold',
    color: AppColors.white,
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
    fontWeight: '600',
    color: AppColors.secondMainColor,
  },
});
