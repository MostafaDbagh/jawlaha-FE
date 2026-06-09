// Ported from: lib/screens/cart/checkout_payment_screen.dart
// Jawlah is Cash on Delivery only (Syria) — see [[jawlaha-cash-on-delivery-only]].
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, w, h, r, sp } from '@/theme';
import { QuicksandFamily } from '@/theme/typography';
import { BaseText } from '@/components';
import { t } from '@/i18n';
import { useI18n } from '@/i18n';
import { useAuthStore } from '@/store/authStore';
import { showSnack } from '@/lib/snack';
import { formatPrice } from '@/lib/currency';
import { useCartStore } from '@/features/cart/cartStore';
import { DELIVERY_FEE } from '@/lib/fees';
import { useOrdersStore } from '@/features/orders/ordersStore';
import { navArgs, useNavArgs } from '@/store/navArgs';

// Glyph per delivery type for the location double-check row.
const TYPE_GLYPH: Record<'home' | 'work' | 'other', keyof typeof MaterialIcons.glyphMap> = {
  home: 'home',
  work: 'work',
  other: 'location-on',
};

export default function CheckoutPaymentScreen() {
  const router = useRouter();
  const { isRTL } = useI18n();
  const backIcon = isRTL ? 'arrow-forward' : 'arrow-back';

  const args = useNavArgs((s) => s.args);
  const summary = useCartStore((s) => s.summary);
  const isPlacing = useOrdersStore((s) => s.isLoading);

  // No "leave at door" option: Jawlah is Cash on Delivery only, so the order
  // has to be handed to someone who pays the driver — see
  // [[jawlaha-cash-on-delivery-only]].
  const [dontRingBell, setDontRingBell] = useState(false);
  const [note, setNote] = useState<string>(
    (args?.delivery_note as string) ?? '',
  );

  // Delivery location double-check: the user must tick a checkbox confirming the
  // selected delivery type (Home/Office) before the order can be placed, so a
  // wrong address pick at the previous step gets caught here.
  const deliveryType = (args?.delivery_type as string) ?? '';
  const deliveryIcon = (args?.delivery_icon as 'home' | 'work' | 'other') ?? 'other';
  const deliveryAddress = (args?.delivery_address as string) ?? '';
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const confirmLabel = deliveryType
    ? t('confirm_delivery_to', { type: deliveryType })
    : t('confirm_delivery_location');

  // Flat delivery fee — same value shown on the cart and address steps, and the
  // same the backend charges when the order is placed.
  const deliveryFee = summary.subtotal > 0 ? DELIVERY_FEE : 0;
  const total = summary.subtotal + deliveryFee;

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

  // ---- toggle row ----
  const buildToggleRow = (
    label: string,
    value: boolean,
    onChange: (v: boolean) => void,
  ) => (
    <View style={styles.toggleRow}>
      <BaseText title={label} size={sp(14)} color={AppColors.textColorTheme} />
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: AppColors.primaryColorTheme, false: AppColors.lightGreyV2 }}
        thumbColor={AppColors.white}
      />
    </View>
  );

  const onConfirm = async () => {
    // Must confirm the delivery location (Home/Office) first.
    if (!locationConfirmed) {
      showSnack(t('confirm_location_required'), 'info');
      return;
    }
    // Only signed-in users can place an order.
    if (!useAuthStore.getState().isLoggedIn) {
      showSnack(t('login_required_to_order'), 'info');
      router.push('/login');
      return;
    }
    const order = await useOrdersStore.getState().createOrder({
      delivery_address: (args?.delivery_address as string) ?? null,
      delivery_lat: (args?.delivery_lat as number) ?? null,
      delivery_lng: (args?.delivery_lng as number) ?? null,
      delivery_note: note.trim() || null,
      dont_ring_bell: dontRingBell,
    });
    if (order) {
      await useCartStore.getState().clear();
      navArgs.set({ order });
      router.replace('/checkout-success');
    }
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

        {/* Cash on Delivery — the only supported method (selected). */}
        <View
          style={[
            styles.methodItem,
            {
              borderColor: AppColors.primaryColorTheme,
              borderWidth: 1.5,
            },
          ]}
        >
          <MaterialIcons
            name="attach-money"
            size={sp(24)}
            color={AppColors.darkGray}
          />
          <View style={{ width: w(12) }} />
          <View style={{ flex: 1 }}>
            <BaseText
              title={t('cash_on_delivery')}
              size={sp(14)}
              color={AppColors.textColorTheme}
              fontWeight="600"
            />
          </View>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" color={AppColors.white} size={sp(14)} />
          </View>
        </View>

        <View style={{ height: h(24) }} />

        {/* Delivery Preferences — "leave at door" intentionally omitted: with
            Cash on Delivery the order must be handed over in person to collect
            payment. */}
        {buildToggleRow(t('dont_ring_bell'), dontRingBell, setDontRingBell)}

        <View style={{ height: h(16) }} />

        {/* Delivery note */}
        <BaseText
          title={t('delivery_instructions_label')}
          size={sp(14)}
          color={AppColors.textColor2}
        />
        <View style={{ height: h(8) }} />
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          maxLength={140}
          placeholder={t('leave_at_door_placeholder')}
          placeholderTextColor={AppColors.textColor2}
          style={styles.noteInput}
          textAlignVertical="top"
        />

        <View style={{ height: h(24) }} />

        {/* Order Summary Title */}
        <BaseText
          title={t('order_summary')}
          size={sp(14)}
          color={AppColors.textColor2}
        />
        <View style={{ height: h(12) }} />

        {/* Summary Rows */}
        {buildSummaryRow(t('subtotal'), formatPrice(summary.subtotal))}
        <View style={{ height: h(8) }} />
        {buildSummaryRow(t('delivery_fee'), formatPrice(deliveryFee))}
        <View style={{ height: h(8) }} />
        {buildSummaryRow(t('discount'), formatPrice(0))}

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
            title={formatPrice(total)}
            size={sp(16)}
            fontWeight="bold"
            color={AppColors.textColorTheme}
          />
        </View>

        <View style={{ height: h(24) }} />

        {/* Delivery location double-check — tap to confirm Home/Office. */}
        <Pressable
          onPress={() => setLocationConfirmed((v) => !v)}
          style={[styles.confirmLocationRow, locationConfirmed && styles.confirmLocationRowOn]}
        >
          <View style={[styles.checkbox, locationConfirmed && styles.checkboxOn]}>
            {locationConfirmed ? (
              <Ionicons name="checkmark" size={sp(16)} color={AppColors.white} />
            ) : null}
          </View>
          <View style={{ width: w(10) }} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons
                name={TYPE_GLYPH[deliveryIcon]}
                size={sp(18)}
                color={AppColors.primaryColorTheme}
              />
              <View style={{ width: w(6) }} />
              <BaseText
                title={confirmLabel}
                size={sp(14)}
                fontWeight="600"
                color={AppColors.textColorTheme}
              />
            </View>
            {deliveryAddress ? (
              <>
                <View style={{ height: h(2) }} />
                <BaseText
                  title={deliveryAddress}
                  size={sp(12)}
                  color={AppColors.textColor2}
                />
              </>
            ) : null}
          </View>
        </Pressable>

        <View style={{ height: h(16) }} />

        {/* Final-order notice: once confirmed the order can't be cancelled or
            changed (Keeta-style — also stated in the Terms & Privacy Policy). */}
        <View style={styles.finalNoticeRow}>
          <Ionicons
            name="information-circle-outline"
            size={sp(18)}
            color={AppColors.textColor2}
          />
          <View style={{ width: w(8) }} />
          <BaseText
            title={t('order_final_notice')}
            size={sp(12)}
            color={AppColors.textColor2}
            style={{ flex: 1 }}
          />
        </View>

        <View style={{ height: h(12) }} />

        {/* Confirm Order Button */}
        <Pressable
          onPress={onConfirm}
          disabled={isPlacing}
          style={[styles.confirmBtn, (isPlacing || !locationConfirmed) && { opacity: 0.6 }]}
        >
          {isPlacing ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <BaseText
              title={t('confirm_order_btn')}
              color={AppColors.white}
              size={sp(16)}
              fontWeight="bold"
            />
          )}
        </Pressable>

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
  checkCircle: {
    padding: w(2),
    backgroundColor: AppColors.primaryColorTheme,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteInput: {
    minHeight: h(70),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(8),
    padding: w(12),
    fontSize: sp(14),
    fontFamily: QuicksandFamily.regular,
    color: AppColors.textColorTheme,
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
  finalNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: w(10),
    borderRadius: r(8),
    backgroundColor: 'rgba(143, 169, 189, 0.12)',
  },
  confirmLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: w(12),
    borderRadius: r(8),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    backgroundColor: AppColors.white,
  },
  confirmLocationRowOn: {
    borderColor: AppColors.primaryColorTheme,
    backgroundColor: 'rgba(35,90,94,0.06)',
  },
  checkbox: {
    width: sp(22),
    height: sp(22),
    borderRadius: r(6),
    borderWidth: 1.5,
    borderColor: AppColors.lightGreyV2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.white,
  },
  checkboxOn: {
    backgroundColor: AppColors.primaryColorTheme,
    borderColor: AppColors.primaryColorTheme,
  },
});
