// Ported from: lib/screens/cart/widgets/order_summary_card.dart
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppColors, w, h, r, sp, TextStyles } from '@/theme';
import { quicksand } from '@/theme/typography';
import { t } from '@/i18n';
import { BaseText } from '@/components';

export interface OrderSummaryCardProps {
  subtotal: string;
  deliveryFee: string;
  taxes: string;
  discount: string;
  total: string;
}

function SummaryRow({
  label,
  value,
  isBold,
  isDiscount = false,
}: {
  label: string;
  value: string;
  isBold: boolean;
  isDiscount?: boolean;
}) {
  return (
    <View style={styles.row}>
      <BaseText
        title={label}
        style={{
          fontSize: isBold ? sp(16) : sp(14),
          fontFamily: quicksand(isBold ? 'bold' : 'normal'),
          color: isBold ? AppColors.textColorTheme : AppColors.textColor2,
        }}
      />
      <BaseText
        title={value}
        style={{
          fontSize: isBold ? sp(16) : sp(14),
          fontFamily: quicksand(isBold ? 'bold' : '600'),
          color: isBold
            ? AppColors.textColorTheme
            : isDiscount
            ? AppColors.green
            : AppColors.textColorTheme,
        }}
      />
    </View>
  );
}

export function OrderSummaryCard(props: OrderSummaryCardProps) {
  const { subtotal, deliveryFee, taxes, discount, total } = props;
  return (
    <View style={styles.container}>
      <BaseText
        title={t('order_summary')}
        style={[TextStyles.bodyMedium, { fontFamily: quicksand('bold'), fontSize: sp(16) }]}
      />
      <View style={{ height: h(16) }} />
      <SummaryRow label={t('subtotal')} value={subtotal} isBold={false} />
      <View style={{ height: h(12) }} />
      <SummaryRow label={t('delivery_fee')} value={deliveryFee} isBold={false} />
      <View style={{ height: h(12) }} />
      <SummaryRow
        label={`${t('taxes')} (${t('vat')})`}
        value={taxes}
        isBold={false}
      />
      <View style={{ height: h(12) }} />
      <SummaryRow
        label={t('discount')}
        value={discount}
        isBold={false}
        isDiscount
      />
      <View style={{ height: h(16) }} />
      <View style={styles.divider} />
      <View style={{ height: h(12) }} />
      <SummaryRow label={t('total')} value={total} isBold={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: w(16),
    backgroundColor: AppColors.white,
    borderRadius: r(12),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.lightGray + '4D', // withOpacity(0.3)
  },
});
