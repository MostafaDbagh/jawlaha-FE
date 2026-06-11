// My Cart — items grouped by vendor (branch), promo code, and order summary.
// Layout per the Jawla Figma; teal theme + SYP. Cart items/qty are wired to the
// real server cart; vendor name/rating/delivery-time come from the branches list.
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppImage, BaseText } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { showSnack } from '@/lib/snack';
import { formatPrice } from '@/lib/currency';
import { applyPromo, computeTotals } from '@/lib/fees';
import { navArgs } from '@/store/navArgs';
import { goBack } from '@/lib/nav';
import { useCartStore, type CartItem } from '@/features/cart/cartStore';
import { useBranchesStore } from '@/features/branches/branchesStore';
import { CartItemCard, OrderSummaryCard, PromoCodeInput } from '@/components/cards';

interface VendorGroup {
  branchId: string;
  name: string;
  image?: string;
  rating?: number;
  deliveryTime?: string;
  items: CartItem[];
}

// Sub-label under the item name (e.g. "Extra ripe") built from the chosen
// options/variation plus the special-request note, when present. Empty string
// hides the row.
function optionLabel(item: CartItem): string {
  const opts = Array.isArray(item.options)
    ? item.options
        .map((o: any) => o?.name ?? o?.label ?? o?.value)
        .filter(Boolean)
        .join(', ')
    : '';
  const note = typeof item.note === 'string' && item.note.trim() ? `"${item.note.trim()}"` : '';
  return [opts, note].filter(Boolean).join(' • ');
}

export default function CartScreen() {
  const router = useRouter();

  const [promo, setPromo] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const items = useCartStore((s) => s.items);
  const summary = useCartStore((s) => s.summary);
  const isLoading = useCartStore((s) => s.isLoading);
  const branches = useBranchesStore((s) => s.branches);

  useEffect(() => {
    useCartStore.getState().loadCart();
    // Branches power the vendor header (name / rating / delivery time).
    if (useBranchesStore.getState().branches.length === 0) {
      useBranchesStore.getState().getBranches();
    }
  }, []);

  // Re-resolve the discount whenever the subtotal changes so an applied promo
  // stays correct after quantity edits.
  useEffect(() => {
    if (appliedCode) {
      setDiscount(applyPromo(appliedCode, summary.subtotal).discount);
    }
  }, [appliedCode, summary.subtotal]);

  // Group cart lines by branch, decorated with branch metadata when available.
  const groups: VendorGroup[] = useMemo(() => {
    const byId = new Map<string, VendorGroup>();
    for (const it of items) {
      const id = (it.branch_id ?? 'unknown') as string;
      let g = byId.get(id);
      if (!g) {
        const b = branches.find((br) => String(br.id) === String(id));
        g = {
          branchId: id,
          name: b?.name ?? t('restaurants'),
          image: b?.image,
          rating: b?.rating,
          deliveryTime: b?.deliveryTime,
          items: [],
        };
        byId.set(id, g);
      }
      g.items.push(it);
    }
    return Array.from(byId.values());
  }, [items, branches]);

  const totals = computeTotals(summary.subtotal, discount);

  const onApplyPromo = () => {
    const res = applyPromo(promo, summary.subtotal);
    if (res.valid) {
      setAppliedCode(res.code);
      setDiscount(res.discount);
    } else {
      setAppliedCode(null);
      setDiscount(0);
      showSnack(t('invalid_promo'), 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable style={styles.leading} onPress={() => goBack(router, '/(tabs)')}>
          <MaterialIcons name="arrow-back" size={sp(24)} color={AppColors.textColorTheme} />
        </Pressable>
        <BaseText title={t('my_cart')} style={styles.appBarTitle} />
        <View style={styles.leading} />
      </View>

      <View style={{ flex: 1 }}>
        {isLoading && items.length === 0 ? (
          <View style={styles.centeredFill}>
            <ActivityIndicator color={AppColors.primaryColor} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centeredFill}>
            <BaseText title={t('empty_cart')} style={styles.emptyText} />
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            <View
              style={[
                styles.bodyPadding,
                { paddingHorizontal: Responsive.getResponsivePadding().paddingHorizontal },
              ]}
            >
              <View style={{ height: h(16) }} />

              {/* Vendor groups */}
              {groups.map((g) => (
                <View key={g.branchId} style={{ marginBottom: h(8) }}>
                  {/* Vendor header */}
                  <View style={styles.vendorHeader}>
                    <View style={styles.vendorAvatar}>
                      {g.image ? (
                        <AppImage source={g.image} width={w(40)} height={w(40)} borderRadius={w(20)} contentFit="cover" />
                      ) : (
                        <MaterialIcons name="storefront" size={sp(22)} color={AppColors.primaryColor} />
                      )}
                    </View>
                    <View style={{ width: w(10) }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <BaseText title={g.name} size={sp(16)} fontWeight="bold" color={AppColors.textColorTheme} />
                        {g.rating != null && (
                          <>
                            <View style={{ width: w(8) }} />
                            <Ionicons name="star" size={sp(13)} color={AppColors.startColor} />
                            <View style={{ width: w(2) }} />
                            <BaseText title={g.rating.toFixed(1)} size={sp(13)} fontWeight="600" color={AppColors.textColorTheme} />
                          </>
                        )}
                      </View>
                      {!!g.deliveryTime && (
                        <BaseText title={g.deliveryTime} size={sp(12)} color={AppColors.textColor2} />
                      )}
                    </View>
                  </View>

                  {/* Items in this vendor group */}
                  {g.items.map((item) => {
                    // Prefer the per-line id so duplicate products with different
                    // add-ons are addressed (and keyed) independently.
                    const lineKey = item.id ?? item.product_id;
                    const optionsTotal = Array.isArray(item.options)
                      ? item.options.reduce((s: number, o: any) => s + (Number(o?.price) || 0), 0)
                      : 0;
                    return (
                      <CartItemCard
                        key={lineKey}
                        name={item.name}
                        description={optionLabel(item)}
                        price={`${formatPrice(item.unit_price + optionsTotal)} × ${item.qty}`}
                        imageUrl={item.image ?? ''}
                        quantity={item.qty}
                        onIncrement={() => useCartStore.getState().updateItem(lineKey, item.qty + 1)}
                        onDecrement={() => {
                          if (item.qty <= 1) useCartStore.getState().removeItem(lineKey);
                          else useCartStore.getState().updateItem(lineKey, item.qty - 1);
                        }}
                        onDelete={() => useCartStore.getState().removeItem(lineKey)}
                      />
                    );
                  })}

                  {/* Add More Items */}
                  <Pressable
                    style={styles.addMoreRow}
                    onPress={() => {
                      if (g.branchId !== 'unknown') {
                        navArgs.set({ branchId: g.branchId });
                        router.push('/vendor-details');
                      } else {
                        router.push('/(tabs)');
                      }
                    }}
                  >
                    <MaterialIcons name="add" size={sp(20)} color={AppColors.primaryColor} />
                    <View style={{ width: w(6) }} />
                    <BaseText title={t('add_more_items')} size={sp(14)} fontWeight="600" color={AppColors.primaryColor} />
                  </Pressable>

                  <View style={styles.groupDivider} />
                </View>
              ))}

              <View style={{ height: h(8) }} />

              {/* Promo Code */}
              <PromoCodeInput
                value={promo}
                onChangeText={setPromo}
                onApply={onApplyPromo}
                isApplied={!!appliedCode}
                appliedMessage={
                  appliedCode ? t('promo_applied_success', { code: appliedCode }) : null
                }
              />

              <View style={{ height: h(20) }} />

              {/* Order Summary */}
              <OrderSummaryCard
                subtotal={formatPrice(totals.subtotal)}
                deliveryFee={formatPrice(totals.deliveryFee)}
                taxes={formatPrice(totals.tax)}
                discount={discount > 0 ? `-${formatPrice(totals.discount)}` : formatPrice(0)}
                total={formatPrice(totals.total)}
              />

              <View style={{ height: h(20) }} />
            </View>
          </ScrollView>
        )}

        {/* Bottom Buttons — "Proceed to checkout" only makes sense with items
            in the cart, so an empty cart shows just "Continue shopping". */}
        <View style={styles.bottomBar}>
          <Pressable style={styles.outlinedButton} onPress={() => router.push('/(tabs)')}>
            <BaseText title={t('continue_shopping')} style={styles.outlinedButtonText} />
          </Pressable>
          {items.length > 0 && (
            <>
              <View style={{ height: h(12) }} />
              <Pressable
                style={styles.elevatedButton}
                onPress={() => {
                  if (!useAuthStore.getState().isLoggedIn) {
                    showSnack(t('login_required_to_order'), 'info');
                    router.push('/login');
                    return;
                  }
                  router.push('/checkout-address');
                }}
              >
                <BaseText title={t('proceed_to_checkout')} style={styles.elevatedButtonText} />
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.backgroundColor },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: h(56),
    backgroundColor: AppColors.white,
    paddingHorizontal: w(4),
  },
  leading: { width: w(48), height: w(48), alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { color: AppColors.textColorTheme, fontSize: sp(18), fontFamily: quicksand('bold') },
  bodyPadding: { alignItems: 'stretch' },
  centeredFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: sp(16), color: AppColors.textColor2 },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h(12),
  },
  vendorAvatar: {
    width: w(40),
    height: w(40),
    borderRadius: w(20),
    backgroundColor: 'rgba(35,90,94,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: h(8),
    marginBottom: h(4),
  },
  groupDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.lightGray + '4D',
    marginTop: h(8),
    marginBottom: h(8),
  },
  bottomBar: {
    padding: w(16),
    backgroundColor: AppColors.white,
    shadowColor: AppColors.black,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  outlinedButton: {
    width: '100%',
    height: h(50),
    borderWidth: 1.5,
    borderColor: AppColors.primaryColor,
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedButtonText: { color: AppColors.primaryColor, fontSize: sp(16), fontFamily: quicksand('bold') },
  elevatedButton: {
    width: '100%',
    height: h(50),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  elevatedButtonText: { color: AppColors.white, fontSize: sp(16), fontFamily: quicksand('bold') },
});
