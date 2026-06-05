// Ported from screens/profile_screens/widgets/support_team_response_card.dart
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppColors, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { BaseText } from '@/components';

// Mirrors ResponsiveUtils.getResponsiveFontSize(context) on mobile (screenWidth < 600):
// baseSize = responsiveTextMedium (sp(14)), optionally multiplied by `scale`.
const responsiveFontSize = (scale = 1) => sp(14) * scale;

export interface SupportTeamResponseCardProps {
  details: string;
}

export function SupportTeamResponseCard({ details }: SupportTeamResponseCardProps) {
  return (
    <View style={styles.container}>
      <BaseText
        title={t('about')}
        style={[styles.title, { fontSize: responsiveFontSize() }]}
      />
      <BaseText
        title={details}
        maxLines={25}
        style={{ fontSize: responsiveFontSize(0.95) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: Responsive.gap,
    paddingHorizontal: Responsive.paddingSmall,
    marginBottom: Responsive.gapSmall,
    borderRadius: Responsive.borderRadiusSmall,
    // AppColors.primaryColorTheme.withAlpha(60) -> alpha 60/255 ≈ 0.235
    backgroundColor: `${AppColors.primaryColorTheme}3C`,
    alignItems: 'flex-start',
    gap: Responsive.gapTiny,
  },
  title: {
    color: AppColors.primaryColorTheme,
    fontFamily: quicksand('500'),
  },
});

export default SupportTeamResponseCard;
