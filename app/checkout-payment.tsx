// Ported from: lib/screens/cart/checkout_payment_screen.dart
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, w, h, r, sp } from '@/theme';
import { BaseText } from '@/components';
import { t } from '@/i18n';
import { useI18n } from '@/i18n';
import { useAuthStore } from '@/store/authStore';
import { showSnack } from '@/lib/snack';

export default function CheckoutPaymentScreen() {
  const router = useRouter();
  const { isRTL } = useI18n();
  const backIcon = isRTL ? 'arrow-forward' : 'arrow-back';

  const [selectedMethod, setSelectedMethod] = useState<string>('visa'); // 'visa', 'cash'

  // ---- _buildPaymentMethodItem ----
  const buildPaymentMethodItem = (opts: {
    value: string;
    title: string;
    iconData?: React.ReactNode;
    hasIcon?: boolean;
    iconWidget?: React.ReactNode;
  }) => {
    const { value, title, iconData, hasIcon = false, iconWidget } = opts;
    const isSelected = selectedMethod === value;
    return (
      <Pressable
        onPress={() => setSelectedMethod(value)}
        style={[
          styles.methodItem,
          {
            borderColor: isSelected
              ? AppColors.primaryColorTheme
              : AppColors.lightGreyV2,
            borderWidth: isSelected ? 1.5 : 1,
          },
        ]}
      >
        {hasIcon && iconWidget ? (
          iconWidget
        ) : iconData ? (
          iconData
        ) : null}

        <View style={{ width: w(12) }} />

        <View style={{ flex: 1 }}>
          <BaseText
            title={title}
            size={sp(14)}
            color={isSelected ? AppColors.textColorTheme : AppColors.darkGray}
            fontWeight={isSelected ? '600' : 'normal'}
          />
        </View>

        {isSelected ? (
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" color={AppColors.white} size={sp(14)} />
          </View>
        ) : (
          <View style={styles.emptyCircle} />
        )}
      </Pressable>
    );
  };

  // ---- _buildSummaryRow ----
  const buildSummaryRow = (label: string, value: string) => (
    <View style={styles.rowBetween}>
      <BaseText title={label} size={sp(14)} color={AppColors.textColor3} />
      <BaseText
        title={value}
        size={sp(14)}
        color={AppColors.textColorTheme}
        fontWeight="500"
      />
    </View>
  );

  // ---- _buildSocialPayButton ----
  const buildSocialPayButton = (opts: {
    icon: React.ReactNode;
    text: string;
    onTap: () => void;
    isGoogle?: boolean;
  }) => {
    const { icon, text, onTap, isGoogle = false } = opts;
    return (
      <Pressable onPress={onTap} style={styles.socialBtn}>
        {isGoogle ? (
          // Simple colored G logic or just icon
          <BaseText
            title="G"
            size={sp(20)}
            fontWeight="bold"
            color={AppColors.blue}
          /> // Placeholder
        ) : (
          icon
        )}
        <View style={{ width: w(8) }} />
        <BaseText
          title={text}
          size={sp(16)}
          color={AppColors.textColorTheme}
          fontWeight="500"
        />
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
    >
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <Ionicons
            name={backIcon as any}
            size={r(24)}
            color={AppColors.textColorTheme}
          />
        </Pressable>
        <View style={styles.titleWrap}>
          <BaseText
            title={t('payment_title')}
            size={sp(18)}
            fontWeight="bold"
            color={AppColors.textColorTheme}
          />
        </View>
        <View style={{ width: r(24) + 8 }} />
      </View>
      <View style={styles.appBarDivider} />

      <ScrollView contentContainerStyle={styles.body}>
        {/* Payment Methods Header */}
        <BaseText
          title={t('payment_methods_label')}
          size={sp(16)}
          color={AppColors.textColor2}
        />
        <View style={{ height: h(12) }} />

        {/* Visa Card Item */}
        {buildPaymentMethodItem({
          value: 'visa',
          title: '•••• 4242',
          hasIcon: true,
          iconWidget: (
            <View style={styles.visaBadge}>
              <BaseText
                title="VISA"
                color={AppColors.white}
                size={sp(8)}
                fontWeight="bold"
              />
            </View>
          ),
        })}
        <View style={{ height: h(12) }} />

        {/* Cash on Delivery Item */}
        {buildPaymentMethodItem({
          value: 'cash',
          title: t('cash_on_delivery'),
          iconData: (
            <MaterialIcons
              name="attach-money"
              size={sp(24)}
              color={AppColors.darkGray}
            />
          ),
        })}
        <View style={{ height: h(12) }} />

        {/* Add New Card */}
        <Pressable
          onPress={() => {
            // Handle add card
          }}
          style={styles.addCard}
        >
          <Ionicons name="add" size={sp(20)} color={AppColors.textColor2} />
          <View style={{ width: w(12) }} />
          <BaseText
            title={t('add_new_card')}
            size={sp(14)}
            color={AppColors.textColorTheme}
          />
        </Pressable>

        <View style={{ height: h(24) }} />

        {/* Order Summary Title */}
        <BaseText
          title={t('order_summary')}
          size={sp(14)}
          color={AppColors.textColor2}
        />
        <View style={{ height: h(12) }} />

        {/* Summary Rows */}
        {buildSummaryRow(t('subtotal'), 'AED 103.00')}
        <View style={{ height: h(8) }} />
        {buildSummaryRow(t('delivery_fee'), 'AED 10.00')}
        <View style={{ height: h(8) }} />
        {buildSummaryRow(`${t('taxes')} (${t('vat')})`, 'AED 5.15')}
        <View style={{ height: h(8) }} />
        {buildSummaryRow(t('driver_tip_label'), 'AED 10')}
        {/* Using driver_tip_label */}
        <View style={{ height: h(8) }} />
        {buildSummaryRow(t('discount'), '-AED 8.50')}

        <View style={{ height: h(16) }} />
        <View style={styles.divider} />
        <View style={{ height: h(12) }} />

        {/* Total Row */}
        <View style={styles.rowBetween}>
          <BaseText
            title={t('total')}
            size={sp(16)}
            color={AppColors.textColorTheme}
          />
          <BaseText
            title="AED 119.65"
            size={sp(16)}
            fontWeight="bold"
            color={AppColors.textColorTheme}
          />
        </View>

        <View style={{ height: h(24) }} />

        {/* Confirm Order Button */}
        <Pressable
          onPress={() => {
            // Only signed-in users can place an order.
            if (!useAuthStore.getState().isLoggedIn) {
              showSnack(t('login_required_to_order'), 'info');
              router.push('/login');
              return;
            }
            router.push('/checkout-success');
          }}
          style={styles.confirmBtn}
        >
          <BaseText
            title={t('confirm_order_btn')}
            color={AppColors.white}
            size={sp(16)}
            fontWeight="bold"
          />
        </Pressable>
        {/* Assuming primaryColor is dark teal as per image */}

        <View style={{ height: h(24) }} />

        {/* Or pay using */}
        <View style={styles.orRow}>
          <View style={[styles.flexDivider, { flex: 1 }]} />
          <View style={{ paddingHorizontal: w(16) }}>
            <BaseText
              title={t('or_pay_using')}
              color={AppColors.textColor2}
              size={sp(14)}
            />
          </View>
          <View style={[styles.flexDivider, { flex: 1 }]} />
        </View>
        <View style={{ height: h(16) }} />

        {/* Social Pay Buttons */}
        {buildSocialPayButton({
          icon: (
            <FontAwesome name="apple" color={AppColors.black} size={sp(24)} />
          ),
          text: t('apple_pay'),
          onTap: () => {},
        })}
        <View style={{ height: h(12) }} />
        {buildSocialPayButton({
          icon: (
            <MaterialIcons
              name="g-translate"
              color={AppColors.black}
              size={sp(24)}
            />
          ), // Placeholder for Google G logo
          text: t('google_pay'),
          onTap: () => {},
          isGoogle: true,
        })}
        <View style={{ height: h(24) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: AppColors.white,
  },
  backBtn: { padding: 4 },
  titleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  appBarDivider: {
    height: 1,
    backgroundColor: 'rgba(143, 169, 189, 0.3)', // AppColors.lightGray.withOpacity(0.3)
  },
  body: {
    padding: w(16),
  },
  methodItem: {
    padding: w(16),
    borderRadius: r(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  visaBadge: {
    width: w(32),
    height: h(20),
    backgroundColor: AppColors.visaCardColor,
    borderRadius: r(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    padding: w(2),
    backgroundColor: AppColors.primaryColorTheme,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: w(20),
    height: w(20),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
  },
  addCard: {
    padding: w(16),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(143, 169, 189, 0.3)', // AppColors.lightGray.withOpacity(0.3)
  },
  confirmBtn: {
    width: '100%',
    height: h(50),
    backgroundColor: AppColors.primaryColorTheme,
    borderRadius: r(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexDivider: {
    height: 1,
    backgroundColor: AppColors.lightGreyV2,
  },
  socialBtn: {
    width: '100%',
    height: h(50),
    backgroundColor: AppColors.lightGreyV2,
    borderRadius: r(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
