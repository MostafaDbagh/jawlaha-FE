// Ported from: lib/screens/cart/widgets/promo_code_input.dart
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BaseText } from '@/components';
import { t } from '@/i18n';
import { AppColors, h, r, sp, w } from '@/theme';
import { QuicksandFamily, quicksand } from '@/theme/typography';

export interface PromoCodeInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onApply?: () => void;
  isApplied?: boolean;
  appliedMessage?: string | null;
}

export function PromoCodeInput(props: PromoCodeInputProps) {
  const {
    value,
    onChangeText,
    onApply,
    isApplied = false,
    appliedMessage,
  } = props;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={t('enter_promo_code')}
            placeholderTextColor={AppColors.textColor2}
            style={styles.input}
          />
        </View>
        <View style={{ width: w(12) }} />
        <Pressable onPress={onApply} style={styles.applyButton}>
          <BaseText title={t('apply')} style={styles.applyText} />
        </Pressable>
      </View>
      {isApplied && appliedMessage != null ? (
        <>
          <View style={{ height: h(12) }} />
          <BaseText title={appliedMessage} style={styles.appliedMessage} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: w(16),
    backgroundColor: 'rgba(239, 242, 245, 0.3)', // AppColors.lightGreyV2 @ 0.3
    borderRadius: r(12),
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  inputWrapper: {
    flex: 1,
    height: h(50),
    paddingHorizontal: w(16),
    justifyContent: 'center',
    backgroundColor: AppColors.white,
    borderRadius: r(8),
    borderWidth: 1,
    borderColor: 'rgba(143, 169, 189, 0.3)', // AppColors.lightGray @ 0.3
  },
  input: {
    padding: 0,
    fontSize: sp(14),
    fontFamily: QuicksandFamily.regular,
    color: AppColors.textColor2,
  },
  applyButton: {
    minWidth: w(80),
    height: h(50),
    paddingHorizontal: w(8),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: AppColors.white,
    fontSize: sp(14),
    fontFamily: quicksand('bold'),
  },
  appliedMessage: {
    color: AppColors.green,
    fontSize: sp(12),
    fontFamily: quicksand('500'),
  },
});
