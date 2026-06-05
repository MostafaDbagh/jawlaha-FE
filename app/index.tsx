// Ported from: lib/screens/auth/splash_screen.dart
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppColors } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { AppImage } from '@/components';
import { Res } from '@/lib/assets';
import { prefs } from '@/lib/storage';
import { useAuthStore } from '@/store/authStore';
import { useAuthControllerStore } from '@/features/auth/authStore';

export default function SplashScreen() {
  const router = useRouter();

  // controller = Get.find<AuthController>();
  // controller.initSettings();  -> initState()
  useEffect(() => {
    const initSettings = useAuthControllerStore.getState().initSettings;
    (async () => {
      // Mirrors AuthController.initSettings(): init storage/lang, read token,
      // load profile when present. In Flutter this always Get.offAllNamed(Routes.main);
      // here the splash route decides where to navigate after the logic runs.
      await initSettings();

      try {
        const isLoggedIn = useAuthStore.getState().isLoggedIn;
        // prefs.getIsFirstOpen() mirrors get_storage first-open flag.
        const isFirstOpen = prefs.getIsFirstOpen();
        void isFirstOpen;

        if (isLoggedIn) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      } catch (e) {
        router.replace('/login');
      }
    })();
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Scaffold(extendBody: true, extendBodyBehindAppBar: true) */}
      {/* SizedBox(height: Get.height, width: Get.width) -> flex: 1 */}
      <View style={styles.body}>
        {/* Stack(fit: StackFit.expand) with a centered logo */}
        <View style={styles.center}>
          {/* GeneralImageAssets(path: Res.mainLogoJawlah,
                width/height: ResponsiveUtils.responsiveLogoSquar, BoxFit.contain) */}
          <AppImage
            source={Res.mainLogoJawlah}
            style={{
              width: Responsive.logoSquare,
              height: Responsive.logoSquare,
            }}
            contentFit="contain"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  body: {
    flex: 1,
  },
  center: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
