// Onboarding shown on first launch (before the app lets the user browse as a guest).
import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp, screenWidth, TextStyles } from '@/theme';
import { t } from '@/i18n';
import { AppImage, BaseText } from '@/components';
import { Res } from '@/lib/assets';
import { prefs } from '@/lib/storage';

const SLIDES = [
  { image: Res.onboardin1, title: 'onboarding_title_1', desc: 'onboarding_desc_1' },
  { image: Res.onboardin2, title: 'onboarding_title_2', desc: 'onboarding_desc_2' },
  { image: Res.onboardin3, title: 'onboarding_title_3', desc: 'onboarding_desc_3' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;

  // Mark onboarding as seen, then enter the app as a guest.
  async function finish() {
    await prefs.setIsFirstOpen(true);
    router.replace('/(tabs)');
  }

  function goNext() {
    if (isLast) {
      void finish();
      return;
    }
    const next = page + 1;
    scrollRef.current?.scrollTo({ x: next * screenWidth, animated: true });
    setPage(next);
  }

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    if (idx !== page) setPage(idx);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Skip */}
      <View style={styles.topBar}>
        <Pressable onPress={() => void finish()} hitSlop={12}>
          <BaseText title={t('skip_now')} style={[TextStyles.bodyMedium, styles.skip]} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.flex}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width: screenWidth }]}>
            <AppImage
              source={slide.image}
              style={{ width: w(260), height: w(260) }}
              contentFit="contain"
            />
            <View style={{ height: h(40) }} />
            <BaseText
              title={t(slide.title)}
              style={[TextStyles.titleLarge, styles.center]}
            />
            <View style={{ height: h(12) }} />
            <BaseText
              title={t(slide.desc)}
              style={[TextStyles.bodyMedium, styles.center, styles.desc]}
            />
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.title} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={goNext}>
          <BaseText
            title={isLast ? t('get_started') : t('next')}
            style={[TextStyles.headlineMedium, { color: AppColors.white }]}
          />
        </Pressable>

        <Pressable style={styles.signInRow} onPress={() => router.push('/login')} hitSlop={8}>
          <BaseText title={t('sign_in')} style={[TextStyles.bodySmall, styles.signIn]} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: AppColors.backgroundColor },
  topBar: { alignItems: 'flex-end', paddingHorizontal: w(20), paddingTop: h(8) },
  skip: { color: AppColors.primaryColorTheme, fontWeight: '700' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: w(28) },
  center: { textAlign: 'center' },
  desc: { color: AppColors.greyTextColorV3, maxWidth: w(320) },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: w(8), paddingVertical: h(16) },
  dot: {
    width: r(8),
    height: r(8),
    borderRadius: r(4),
    backgroundColor: AppColors.greyTextColorV3,
    opacity: 0.4,
  },
  dotActive: { opacity: 1, width: r(20), backgroundColor: AppColors.primaryColorTheme },
  actions: { paddingHorizontal: w(24), paddingBottom: h(24), gap: h(12) },
  primaryBtn: {
    minHeight: h(52),
    borderRadius: r(12),
    backgroundColor: AppColors.primaryColorTheme,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInRow: { alignItems: 'center', paddingVertical: h(6) },
  signIn: { color: AppColors.secondMainColor, fontWeight: '700' },
});
