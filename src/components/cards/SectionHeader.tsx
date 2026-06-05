// Ported from screens/cart/widgets/section_header.dart (SectionHeader)
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, h, w, sp, TextStyles } from '@/theme';
import { quicksand } from '@/theme/typography';
import { t } from '@/i18n';
import { BaseText } from '@/components';

export interface SectionHeaderProps {
  title: string;
  onViewAllTap?: () => void;
}

export function SectionHeader({ title, onViewAllTap }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <BaseText
          title={title}
          style={[
            TextStyles.headlineMedium,
            { fontSize: sp(18), fontFamily: quicksand('bold'), color: AppColors.textColorTheme },
          ]}
        />
      </View>
      {onViewAllTap && (
        <Pressable onPress={onViewAllTap} style={styles.viewAllRow}>
          <BaseText
            title={t('view_all')}
            style={[
              TextStyles.bodySmall,
              { color: AppColors.greyTextColorV3, fontFamily: quicksand('400') },
            ]}
          />
          <View style={{ width: w(4) }} />
          <MaterialIcons
            name="arrow-forward"
            size={sp(16)}
            color={AppColors.greyTextColorV3}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: h(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: w(8),
    flexShrink: 0,
  },
});
