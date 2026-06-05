// Ported from Flutter:
//   lib/screens/profile_screens/privacy_police_screen.dart
//   (uses core/style/custom_html.dart -> simple pure-RN HTML fallback)
import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors, sp, r } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppBar, BaseText } from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';

// Mirrors core/style/custom_html.dart. No HTML render lib is installed (heavy native dep),
// so we use a simple pure-RN fallback: a shimmer-like skeleton while loading, and a basic
// tag-stripped text render of the HTML otherwise.
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
            {/* LoadingCard placeholder row */}
            <View
              style={[
                styles.loadingCard,
                // random-ish width per row, mirroring RandomFunc.generateRandomNumber(10,100)
                { width: `${100 - ((index * 7) % 60)}%` as any },
              ]}
            />
          </View>
        ))}
      </View>
    );
  }
  // Basic HTML fallback: strip tags and decode a few entities. Keeps the screen running
  // without a native HTML renderer (see MIGRATION_CONVENTIONS native-features note).
  const text = (data ?? '')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)\s*>/gi, '\n')
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
      size={sp(14)}
      color={AppColors.textColorTheme}
      style={{ lineHeight: r(22) }}
    />
  );
}

export default function PrivacyPolicyScreen() {
  // final ProfileController controller = Get.find();
  const settingLoading = useProfileStore((s) => s.settingLoading);
  const privacyPolice = useProfileStore((s) => s.privacyPolice);

  // initState: controller.getPrivacyPolicy();
  useEffect(() => {
    useProfileStore.getState().getPrivacyPolicy();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* appBar: SubAppBar(title: LocalKeys.privacy_policy.tr) */}
      <AppBar title={t('privacy_policy')} />
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
          data={privacyPolice.hyperText}
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
    height: r(20),
    borderRadius: r(6),
    backgroundColor: AppColors.baserColor,
  },
});
