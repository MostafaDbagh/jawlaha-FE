// Ported from Flutter:
//   lib/screens/profile_screens/content_us_screen.dart
//   (CustomHtml: lib/core/style/custom_html.dart)
// SubAppBar(title: contact_us) + SingleChildScrollView -> GetBuilder -> CustomHtml(contentUs.hyperText)

import React, { useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, sp } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppBar, BaseText } from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';

// ---------------------------------------------------------------------------
// CustomHtml (port of core/style/custom_html.dart).
// flutter_html is a native-leaning dep; no HTML renderer exists in the RN kit
// yet. Fallback: when loading, render a column of shimmer-like loading rows
// (countLoadingCardRow); otherwise strip tags and render the text content.
// TODO: replace with a real HTML renderer (e.g. react-native-render-html).
// ---------------------------------------------------------------------------
function RandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface CustomHtmlProps {
  isLoading?: boolean;
  countLoadingCardRow?: number;
  shrinkWrap?: boolean;
  data?: string;
}

function CustomHtml({
  isLoading = false,
  countLoadingCardRow = 4,
  data,
}: CustomHtmlProps) {
  if (isLoading) {
    return (
      <View style={{ alignItems: 'flex-start' }}>
        {Array.from({ length: countLoadingCardRow }).map((_, index) => (
          <View
            key={index}
            style={{ paddingVertical: Responsive.gapTiny }}
          >
            <View
              style={[
                styles.loadingCard,
                {
                  height: Responsive.getResponsiveFontSize({ scale: 1.2 }),
                  width:
                    Responsive.cardWidth - RandomNumber(10, 100),
                },
              ]}
            />
          </View>
        ))}
      </View>
    );
  }

  // Strip HTML tags as a simple fallback.
  const plain = (data ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();

  return <BaseText title={plain} size={sp(14)} color={AppColors.textColor} />;
}

export default function ContactUsScreen() {
  const settingLoading = useProfileStore((s) => s.settingLoading);
  const contentUs = useProfileStore((s) => s.contentUs);

  // initState: controller.getContactUs();
  useEffect(() => {
    useProfileStore.getState().getContactUs();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBar title={t('contact_us')} />
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
          data={contentUs.hyperText}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  loadingCard: {
    backgroundColor: AppColors.shimmerColor,
    borderRadius: Responsive.borderRadiusSmall,
  },
});
