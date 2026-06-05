// Ported from Flutter:
//   lib/screens/profile_screens/about_us_screen.dart
//   (CustomHtml -> lib/core/style/custom_html.dart)
// AboutUsScreen — GetX ProfileController.getAboutUs() -> useProfileStore.
import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppBar, BaseText } from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';

// Ported from core/style/custom_html.dart (CustomHtml).
// No HTML renderer dep installed — pure-RN fallback per migration conventions:
//   loading -> shimmer-like loading rows; else strip HTML tags and render as text.
function CustomHtml({
  isLoading,
  countLoadingCardRow = 4,
  data,
}: {
  isLoading: boolean;
  shrinkWrap?: boolean;
  countLoadingCardRow?: number;
  data?: string;
}) {
  if (isLoading) {
    return (
      <View style={{ alignItems: 'flex-start' }}>
        {Array.from({ length: countLoadingCardRow }).map((_, index) => (
          <View
            key={index}
            style={{ paddingVertical: Responsive.gapTiny / 2, width: '100%' }}
          >
            <View
              style={[
                styles.loadingCard,
                // mimic the Dart random width variation
                { width: `${100 - ((index * 7) % 60)}%` },
              ]}
            />
          </View>
        ))}
      </View>
    );
  }

  // Pure-RN HTML -> text fallback (no flutter_html equivalent dep).
  const text = (data ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return (
    <BaseText
      title={text}
      size={Responsive.textMedium}
      color={AppColors.textColorTheme}
    />
  );
}

export default function AboutUsScreen() {
  const settingLoading = useProfileStore((s) => s.settingLoading);
  const aboutUs = useProfileStore((s) => s.aboutUs);

  useEffect(() => {
    useProfileStore.getState().getAboutUs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppBar title={t('about_us')} />
      <ScrollView
        contentContainerStyle={[
          Responsive.getResponsivePadding(),
          { paddingTop: Responsive.gapLarge, paddingBottom: Responsive.gapLarge },
        ]}
      >
        <CustomHtml
          isLoading={settingLoading}
          shrinkWrap
          countLoadingCardRow={20}
          data={aboutUs.hyperText}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  loadingCard: {
    height: Responsive.textMedium * 1.2,
    borderRadius: Responsive.borderRadiusTiny,
    backgroundColor: AppColors.hintColor + '33',
  },
});
