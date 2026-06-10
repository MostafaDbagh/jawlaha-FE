// Global mini-cart bar — pinned to the bottom of EVERY screen so the user can
// peek at / open their cart from anywhere. Tapping the bar slides a preview
// sheet up from the bottom (thumbnails + total + "View Cart"). Reads the
// server-backed cart store, so it stays in sync across the whole app.
//
// Mounted once in app/_layout.tsx (an overlay sibling of the navigator). It
// hides itself when the cart is empty, when signed out, and on screens that
// either show the cart already or have their own cart bar (product / vendor
// details, the cart tab, checkout, location pickers).
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, ScrollView, StyleSheet, Platform, TextStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { t } from '@/i18n';
import { formatPrice } from '@/lib/currency';
import { useCartStore } from '@/features/cart/cartStore';
import { useAuthStore } from '@/store/authStore';

// Screens that must NOT show the global bar: they either display the cart
// already or carry their own bottom cart bar.
const HIDE_ON = new Set([
  '/product-details',
  '/vendor-details',
  '/cart',
  '/checkout-address',
  '/checkout-payment',
  '/checkout-success',
  '/tracking-order',
  '/select-city',
  '/choose-location',
  '/pick-location',
]);

// Routes that render the bottom tab bar — the global bar floats just above it.
const TAB_ROUTES = new Set(['/', '/orders', '/profile']);
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

export default function CartBottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const summary = useCartStore((s) => s.summary);
  const items = useCartStore((s) => s.items);

  const [sheetOpen, setSheetOpen] = useState(false);

  // Keep the bar accurate even when the user deep-links straight into a screen
  // that never loads the cart itself.
  useEffect(() => {
    if (isLoggedIn) useCartStore.getState().loadCart();
  }, [isLoggedIn]);

  const hasItems = summary.items_count > 0;
  const visible = isLoggedIn && hasItems && !HIDE_ON.has(pathname);

  // Close the sheet if the bar gets hidden out from under it (e.g. last item
  // removed, or navigation to a hidden screen).
  useEffect(() => {
    if (!visible && sheetOpen) setSheetOpen(false);
  }, [visible, sheetOpen]);

  if (!visible) return null;

  const onTab = TAB_ROUTES.has(pathname);
  const barBottom = (onTab ? TAB_BAR_HEIGHT + insets.bottom : insets.bottom) + h(12);

  const openFullCart = () => {
    setSheetOpen(false);
    router.push('/(tabs)/cart');
  };

  return (
    <>
      {/* Collapsed bar */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.bar, { bottom: barBottom }]}
        onPress={() => setSheetOpen(true)}
      >
        <View style={styles.side}>
          <Ionicons name="cart-outline" size={sp(22)} color={AppColors.white} />
          <View style={{ width: w(10) }} />
          <Raw text={t('items_in_cart', { count: summary.items_count })} style={styles.barCount} />
        </View>
        <View style={styles.side}>
          <Raw text={formatPrice(summary.subtotal)} style={styles.barTotal} />
          <View style={{ width: w(8) }} />
          <Ionicons name="chevron-up" size={sp(20)} color={AppColors.white} />
        </View>
      </TouchableOpacity>

      {/* Slide-up preview sheet */}
      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <Pressable style={[styles.panel, { paddingBottom: insets.bottom + h(16) }]} onPress={() => {}}>
            <View style={styles.grabber} />

            <View style={styles.header}>
              <View style={styles.side}>
                <Ionicons name="cart-outline" size={sp(22)} color={AppColors.primaryColor} />
                <View style={{ width: w(10) }} />
                <Raw text={t('items_in_cart', { count: summary.items_count })} style={styles.headerTitle} />
              </View>
              <TouchableOpacity hitSlop={8} onPress={() => setSheetOpen(false)}>
                <Ionicons name="chevron-down" size={sp(24)} color={AppColors.textColor2} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
              {items.map((it, idx) => (
                <View key={String(it.id ?? it.product_id ?? idx)} style={styles.thumbWrap}>
                  <Image source={{ uri: it.image || '' }} style={styles.thumb} contentFit="cover" />
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyBadgeText}>{it.qty}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <View>
                <Raw text={t('total')} style={styles.totalLabel} />
                <Raw text={formatPrice(summary.subtotal)} style={styles.totalValue} />
              </View>
              <TouchableOpacity activeOpacity={0.85} style={styles.viewCartBtn} onPress={openFullCart}>
                <Raw text={t('view_cart')} style={styles.viewCartText} />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// Inline text that picks the Quicksand weight matching the style's fontWeight.
function Raw({ text, style }: { text: string; style?: TextStyle }) {
  return <Text style={[{ fontFamily: quicksand(style?.fontWeight) }, style]}>{text}</Text>;
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: w(16),
    right: w(16),
    paddingHorizontal: w(16),
    paddingVertical: h(12),
    backgroundColor: AppColors.darkTeal,
    borderRadius: r(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: AppColors.black,
    shadowOpacity: 0.26,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  side: { flexDirection: 'row', alignItems: 'center' },
  barCount: { color: AppColors.white, fontSize: sp(15), fontWeight: '600' },
  barTotal: { color: AppColors.white, fontSize: sp(16), fontWeight: 'bold' },

  backdrop: {
    flex: 1,
    backgroundColor: `${AppColors.black}66`,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: r(24),
    borderTopRightRadius: r(24),
    paddingHorizontal: w(16),
    paddingTop: h(8),
    shadowColor: AppColors.black,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: w(40),
    height: h(4),
    borderRadius: r(2),
    backgroundColor: AppColors.lightGreyV2,
    marginBottom: h(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: h(16),
  },
  headerTitle: { color: AppColors.textColorTheme, fontSize: sp(16), fontWeight: '700' },
  thumbRow: { paddingVertical: h(4), paddingRight: w(8) },
  thumbWrap: { width: w(64), height: w(64), marginRight: w(10) },
  thumb: { width: w(64), height: w(64), borderRadius: r(10), backgroundColor: AppColors.lightGrey },
  qtyBadge: {
    position: 'absolute',
    top: -h(6),
    right: -w(6),
    minWidth: w(20),
    height: w(20),
    paddingHorizontal: w(4),
    borderRadius: r(10),
    backgroundColor: AppColors.darkTeal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.white,
  },
  qtyBadgeText: { color: AppColors.white, fontSize: sp(11), fontFamily: quicksand('700') },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: h(20),
  },
  totalLabel: { color: AppColors.textColor2, fontSize: sp(13), fontWeight: '500' },
  totalValue: { color: AppColors.textColorTheme, fontSize: sp(20), fontWeight: '700' },
  viewCartBtn: {
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(14),
    paddingHorizontal: w(28),
    height: h(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewCartText: { color: AppColors.white, fontSize: sp(16), fontWeight: '700' },
});
