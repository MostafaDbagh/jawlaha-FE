// Ported from: lib/screens/profile_screens/profile_screen.dart (ProfileScreen)
import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppImage, BaseText } from '@/components';
import { ProfileCard } from '@/components/cards';
import type { ProfileCardEntity } from '@/components/cards/ProfileCard';
import { Res } from '@/lib/assets';
import { repository } from '@/data/repository';
import { useAuthStore } from '@/store/authStore';
// Feature store (per task) — profile feature store.
import { useProfileStore } from '@/features/profile/profileStore';

export default function ProfileScreen() {
  const router = useRouter();
  // Obx(() => userInfo.value.name) -> read user name from the global auth store.
  const userName = useAuthStore((s) => s.user?.name) ?? '';
  // imported & available (mirrors Get.find<ProfileController>())
  void useProfileStore;

  // void clearAndNavigateInTab() { ... } — handled by router.replace('/login') below.

  // logout: authController.logoutFromCurrentToken() then NavigationController.logout()
  const logout = async () => {
    await repository.getLogoutFromCurrentToken();
    await useAuthStore.getState().logout();
    // Navigator.of(context).pop();
    // clearAndNavigateInTab();
    router.replace('/login');
  };

  // initState(): profileCardEntityList = [ ... ]
  const profileCardEntityList: ProfileCardEntity[] = useMemo(
    () => [
      {
        title: t('change_password'),
        icon: Res.appleIcon,
        onPress: () => {
          // Get.find<NavigationController>().navigateInTab(Routes.changePassword)
          router.push('/change-password');
        },
      },
      {
        title: t('privacy_policy'),
        icon: Res.appleIcon,
        onPress: () => {
          // navigateInTab(Routes.privacyPolice)
          router.push('/privacy-policy');
        },
      },
      {
        title: t('about_us'),
        icon: Res.appleIcon,
        onPress: () => {
          // navigateInTab(Routes.aboutUs)
          router.push('/about-us');
        },
      },
      {
        title: t('contact_us'),
        icon: Res.appleIcon,
        onPress: () => {
          // navigateInTab(Routes.contentUs)
          router.push('/contact-us');
        },
      },
      {
        title: t('logout'),
        icon: Res.appleIcon,
        onPress: () => {
          logout();
        },
        isLogout: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const profileImageSize = Responsive.profileImageSize;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          Responsive.getResponsivePadding(),
          {
            paddingTop: Responsive.gapLarge * 2,
            paddingBottom: Responsive.gapLarge * 2,
          },
        ]}
      >
        <View style={styles.column}>
          {/* Profile section */}
          <View style={{ height: Responsive.gap }} />
          <View style={styles.stack}>
            <View
              style={[
                styles.avatar,
                { width: profileImageSize, height: profileImageSize },
              ]}
            >
              {/* GeneralNetworkImage(url: "") -> empty url, falls back to icon */}
              <Ionicons
                name="person-circle"
                size={profileImageSize}
                color={AppColors.gray}
              />
            </View>
            <AppImage
              source={Res.appleIcon}
              height={Responsive.iconXLarge}
              width={Responsive.iconXLarge}
              style={styles.avatarBadge}
            />
          </View>
          <View style={{ height: Responsive.gapTiny }} />
          <BaseText
            title={userName}
            style={[TextStyles.displaySmall, { color: AppColors.primaryColorTheme }]}
          />
          <View style={{ height: Responsive.gap }} />

          {/* Menu items */}
          {profileCardEntityList.map((entity, index) => (
            <View key={index}>
              {index > 0 && <CustomDividerSeparator />}
              <ProfileCard profileCardEntity={entity} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Mirrors core/widgets/list_views/custom_divider_separator.dart
function CustomDividerSeparator() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  column: {
    alignItems: 'center',
  },
  stack: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  avatar: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  divider: {
    // Divider(color: AppColors.lightGray, thickness: 0.5 on mobile)
    height: 0.5,
    backgroundColor: AppColors.lightGray,
    marginVertical: Responsive.gap,
  },
});
