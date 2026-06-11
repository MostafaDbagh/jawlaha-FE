// Ported from: lib/screens/categories/product_details_screen.dart
// Real backend data: product + branch passed via navArgs; variations as options.
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  type TextStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { t } from '@/i18n';
import { useProductStore } from '@/features/categories/productStore';
import { useCartStore } from '@/features/cart/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useNavArgs } from '@/store/navArgs';
import { formatPrice } from '@/lib/currency';
import { showSnack } from '@/lib/snack';
import { ProductModel, ProductVariation, ProductOptionGroup } from '@/types/product';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const args = useNavArgs((s) => s.args);

  const currentProduct = useProductStore((s) => s.currentProduct);
  const isLoading = useProductStore((s) => s.isLoading);

  // The bottom bar reflects the real cart, not the local stepper. It only
  // appears once the cart actually has items — an empty cart shows nothing
  // (there's no order to "view" yet).
  const cartSummary = useCartStore((s) => s.summary);
  const cartItems = useCartStore((s) => s.items);
  const cartHasItems = cartSummary.items_count > 0;

  // Slide-up mini-cart preview anchored to the bottom bar.
  const [cartSheetOpen, setCartSheetOpen] = useState(false);

  // Pull the real server cart so the bottom bar / mini-cart reflect items added
  // on other screens too (only meaningful for a signed-in user).
  useEffect(() => {
    if (useAuthStore.getState().isLoggedIn) {
      useCartStore.getState().loadCart();
    }
  }, []);

  const openFullCart = () => {
    setCartSheetOpen(false);
    router.push('/(tabs)/cart');
  };

  // Product comes via navArgs; if only an id is present, fetch it.
  const argProduct = args.product as ProductModel | undefined;
  const product: ProductModel | undefined = argProduct ?? currentProduct ?? undefined;

  useEffect(() => {
    if (!argProduct && args.productId != null) {
      useProductStore.getState().getProduct(args.productId as any);
    }
  }, [argProduct, args.productId]);

  const variations: ProductVariation[] = useMemo(
    () => product?.variations ?? [],
    [product],
  );

  // Add-on groups (appetizers, drinks, extras, sizes…). Selections are kept as a
  // map of group id → selected item ids; the customer pays the server-resolved
  // price, so here we only track which items are picked.
  const optionGroups: ProductOptionGroup[] = useMemo(
    () => product?.optionGroups ?? [],
    [product],
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const toggleOption = (group: ProductOptionGroup, itemId: string) => {
    const gid = String(group.id);
    setSelectedOptions((prev) => {
      const current = prev[gid] ?? [];
      const isSelected = current.includes(itemId);
      let next: string[];
      if (group.multiple === false) {
        // Single-select: tapping the selected item clears it, else it replaces.
        next = isSelected ? [] : [itemId];
      } else if (isSelected) {
        next = current.filter((x) => x !== itemId);
      } else {
        // Respect an optional max — ignore the tap once the cap is reached.
        if (group.max != null && current.length >= group.max) return prev;
        next = [...current, itemId];
      }
      return { ...prev, [gid]: next };
    });
  };

  // Sum of every selected add-on's price across all groups.
  const optionsTotal = useMemo(() => {
    let sum = 0;
    for (const group of optionGroups) {
      const picked = selectedOptions[String(group.id)] ?? [];
      for (const item of group.items ?? []) {
        if (item.id != null && picked.includes(String(item.id))) {
          sum += Number(item.price) || 0;
        }
      }
    }
    return sum;
  }, [optionGroups, selectedOptions]);

  const [selectedVariationId, setSelectedVariationId] = useState<
    string | number | null
  >(null);
  const [qty, setQty] = useState(1);
  const [favorite, setFavorite] = useState(false);
  // Free-text special request sent with the cart line ("extra garlic sauce,
  // no pomegranate sauce"). Free of charge — paid extras live in optionGroups.
  const [note, setNote] = useState('');

  const buildIndicator = (isActive: boolean, key: number) => (
    <View
      key={key}
      style={[
        styles.indicator,
        {
          backgroundColor: isActive
            ? AppColors.white
            : `${AppColors.white}80`,
        },
      ]}
    />
  );

  const buildOptionTile = (option: ProductVariation, index: number) => {
    const isSelected = selectedVariationId === option.id;
    const optionPrice = option.price ?? option.priceModifier ?? 0;
    return (
      <TouchableOpacity
        key={String(option.id ?? index)}
        activeOpacity={0.8}
        onPress={() =>
          setSelectedVariationId((prev) =>
            prev === option.id ? null : (option.id ?? null),
          )
        }
      >
        <View
          style={[
            styles.optionTile,
            {
              backgroundColor: isSelected
                ? `${AppColors.lightTeal}4D` // 0.3 opacity
                : AppColors.white,
              borderColor: isSelected
                ? AppColors.primaryColor
                : AppColors.lightGreyV2,
              borderWidth: isSelected ? 1.5 : 1.0,
            },
          ]}
        >
          <BaseOptionText
            text={option.name ?? ''}
            color={isSelected ? AppColors.primaryColor : AppColors.textColorTheme}
            weight="500"
          />
          <BaseOptionText
            text={`+ ${formatPrice(optionPrice)}`}
            color={isSelected ? AppColors.primaryColor : AppColors.textColor2}
            weight="600"
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Renders one add-on group: a titled section with a required/optional hint and
  // a checkbox (multi) or radio (single-select) row per item.
  const buildOptionGroup = (group: ProductOptionGroup) => {
    const gid = String(group.id);
    const picked = selectedOptions[gid] ?? [];
    const single = group.multiple === false;
    const hint = group.required
      ? t('required_label')
      : single
        ? t('choose_one')
        : group.max != null
          ? t('choose_up_to', { count: group.max })
          : t('optional_label');
    return (
      <View key={gid}>
        <View style={styles.divider} />
        <View style={{ height: h(20) }} />
        <View style={styles.groupHeader}>
          <View style={{ flex: 1, marginEnd: w(8) }}>
            <BaseTextRaw
              text={group.name ?? ''}
              style={{ fontSize: sp(17), fontWeight: '700', color: AppColors.textColorTheme }}
            />
            {!!group.description && (
              <BaseTextRaw
                text={group.description}
                style={{ fontSize: sp(12), fontWeight: '400', color: AppColors.textColor2, marginTop: h(2) }}
              />
            )}
          </View>
          <View
            style={[styles.groupHintPill, group.required && styles.groupHintPillRequired]}
          >
            <Text
              style={[
                styles.groupHintText,
                { color: group.required ? AppColors.errorColor : AppColors.textColor2 },
              ]}
            >
              {hint}
            </Text>
          </View>
        </View>
        <View style={{ height: h(12) }} />
        {(group.items ?? []).map((item) => {
          const itemId = String(item.id);
          const isSelected = picked.includes(itemId);
          const price = Number(item.price) || 0;
          return (
            <TouchableOpacity
              key={itemId}
              activeOpacity={0.8}
              onPress={() => toggleOption(group, itemId)}
            >
              <View
                style={[
                  styles.optionTile,
                  {
                    backgroundColor: isSelected
                      ? `${AppColors.lightTeal}4D`
                      : AppColors.white,
                    borderColor: isSelected
                      ? AppColors.primaryColor
                      : AppColors.lightGreyV2,
                    borderWidth: isSelected ? 1.5 : 1.0,
                  },
                ]}
              >
                <View style={styles.optionTileMain}>
                  <Ionicons
                    name={
                      single
                        ? isSelected
                          ? 'radio-button-on'
                          : 'radio-button-off'
                        : isSelected
                          ? 'checkbox'
                          : 'square-outline'
                    }
                    size={sp(20)}
                    color={isSelected ? AppColors.primaryColor : AppColors.textColor2}
                  />
                  <View style={{ width: w(10) }} />
                  <BaseOptionText
                    text={item.name ?? ''}
                    color={isSelected ? AppColors.primaryColor : AppColors.textColorTheme}
                    weight="500"
                  />
                </View>
                {price > 0 && (
                  <BaseOptionText
                    text={`+ ${formatPrice(price)}`}
                    color={isSelected ? AppColors.primaryColor : AppColors.textColor2}
                    weight="600"
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: h(20) }} />
      </View>
    );
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.root, styles.center]}>
          {isLoading ? (
            <ActivityIndicator color={AppColors.primaryColor} />
          ) : (
            <BaseTextRaw
              text={t('no_orders')}
              style={{ color: AppColors.textColor2 }}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const displayPrice = product.finalPrice ?? product.price ?? 0;
  // Original price is only struck through when there's an actual discount.
  const originalPrice = product.price ?? 0;

  // The selected variation overrides the unit price (its `price` is absolute,
  // matching how the backend resolves it in cartController.addItem). Without
  // this the Add To Cart total stayed at the base price after picking e.g.
  // "Double".
  const selectedVariation =
    selectedVariationId != null
      ? variations.find((v) => v.id === selectedVariationId) ?? null
      : null;
  const unitPrice = selectedVariation
    ? selectedVariation.price ?? selectedVariation.priceModifier ?? displayPrice
    : displayPrice;

  // The struck-through original price only makes sense for a base-product
  // discount; a variation replaces the unit price outright.
  const hasDiscount =
    !selectedVariation &&
    product.finalPrice != null &&
    originalPrice > product.finalPrice;

  const onAddToCart = async () => {
    // Cart is server-side and per-user, so a guest must sign in first.
    if (!useAuthStore.getState().isLoggedIn) {
      showSnack(t('login_required_to_order'), 'info');
      router.push('/login');
      return;
    }
    // Every required add-on group must have at least one selection.
    for (const group of optionGroups) {
      if (group.required && (selectedOptions[String(group.id)] ?? []).length === 0) {
        showSnack(t('please_choose_option', { name: group.name ?? '' }), 'info');
        return;
      }
    }
    // Send only references; the backend resolves names/prices from the product.
    const options = optionGroups.flatMap((group) =>
      (selectedOptions[String(group.id)] ?? []).map((item_id) => ({
        group_id: String(group.id),
        item_id,
      })),
    );
    const res = await useCartStore.getState().addItem({
      product_id: product.id as any,
      qty,
      variation_id: (selectedVariationId ?? null) as any,
      options,
      note: note.trim() || null,
    });
    if (res.ok) {
      // If the backend reset a different restaurant's cart, say so.
      showSnack(res.reset ? t('cart_reset_new_restaurant') : t('added_to_cart'), 'success');
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 0 }}
        >
          {/* Header Image (SliverAppBar expandedHeight 300.h) */}
          <View style={styles.headerImageWrap}>
            <Image
              source={{ uri: product.imageUrl || '' }}
              style={styles.headerImage}
              contentFit="cover"
            />

            {/* Leading back button */}
            <View style={[styles.leadingBtn, { top: insets.top + h(8) }]}>
              <TouchableOpacity hitSlop={8} onPress={() => router.back()}>
                <Ionicons name="arrow-back" color={AppColors.white} size={sp(20)} />
              </TouchableOpacity>
            </View>

            {/* Action favorite button */}
            <View style={[styles.actionBtn, { top: insets.top + h(8) }]}>
              <TouchableOpacity hitSlop={8} onPress={() => setFavorite((v) => !v)}>
                <Ionicons
                  name={favorite ? 'heart' : 'heart-outline'}
                  color={favorite ? AppColors.red : AppColors.white}
                  size={sp(20)}
                />
              </TouchableOpacity>
            </View>

            {/* Carousel indicators mock */}
            <View style={styles.indicatorsRow}>
              {buildIndicator(true, 0)}
              <View style={{ width: w(4) }} />
              {buildIndicator(false, 1)}
              <View style={{ width: w(4) }} />
              {buildIndicator(false, 2)}
            </View>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Name and Price */}
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <BaseTextRaw
                  text={product.name ?? ''}
                  style={{
                    fontSize: sp(24),
                    fontWeight: 'bold',
                    color: AppColors.textColorTheme,
                  }}
                />
              </View>
              <BaseTextRaw
                text={formatPrice(displayPrice)}
                style={{
                  fontSize: sp(18),
                  fontWeight: 'bold',
                  color: AppColors.errorColor, // Reddish color for price
                }}
              />
            </View>
            <View style={{ height: h(16) }} />

            {/* Description */}
            {!!product.description && (
              <>
                <BaseTextRaw
                  text={product.description}
                  style={{
                    fontSize: sp(14),
                    color: AppColors.textColor2,
                    lineHeight: sp(14) * 1.5,
                  }}
                />
                <View style={{ height: h(24) }} />
              </>
            )}

            {variations.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={{ height: h(24) }} />

                {/* Options (variations) */}
                {variations.map((option, index) =>
                  buildOptionTile(option, index),
                )}

                <View style={{ height: h(32) }} />
              </>
            )}

            {/* Add-on groups (appetizers, drinks, extras…) */}
            {optionGroups.map((group) => buildOptionGroup(group))}

            {/* Special request — free-text note passed to the kitchen */}
            <View style={styles.divider} />
            <View style={{ height: h(20) }} />
            <View style={styles.groupHeader}>
              <BaseTextRaw
                text={t('special_request_label')}
                style={{ fontSize: sp(17), fontWeight: '700', color: AppColors.textColorTheme }}
              />
              <View style={styles.groupHintPill}>
                <Text style={[styles.groupHintText, { color: AppColors.textColor2 }]}>
                  {t('optional_label')}
                </Text>
              </View>
            </View>
            <View style={{ height: h(12) }} />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={t('special_request_placeholder')}
              placeholderTextColor={AppColors.textColor2}
              multiline
              maxLength={300}
              style={styles.noteInput}
            />
            <View style={{ height: h(20) }} />

            {/* Quantity stepper + Add to Cart button (inline row) */}
            <View style={styles.actionRow}>
              {/* Quantity stepper */}
              <View style={styles.stepper}>
                <TouchableOpacity
                  hitSlop={8}
                  activeOpacity={0.7}
                  disabled={qty <= 1}
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                  style={styles.stepperBtn}
                >
                  <Ionicons
                    name="remove"
                    size={sp(20)}
                    color={qty <= 1 ? AppColors.textColor2 : AppColors.textColorTheme}
                  />
                </TouchableOpacity>
                <Text style={styles.stepperQty}>{qty}</Text>
                <TouchableOpacity
                  hitSlop={8}
                  activeOpacity={0.7}
                  onPress={() => setQty((q) => q + 1)}
                  style={styles.stepperBtn}
                >
                  <Ionicons
                    name="add"
                    size={sp(20)}
                    color={AppColors.textColorTheme}
                  />
                </TouchableOpacity>
              </View>

              {/* Add to Cart button with price */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onAddToCart}
                style={styles.addToCartBtn}
              >
                <BaseTextRaw
                  text={t('add_to_cart')}
                  style={{
                    color: AppColors.white,
                    fontSize: sp(16),
                    fontWeight: '600',
                  }}
                />
                <View style={{ alignItems: 'flex-end' }}>
                  <BaseTextRaw
                    text={formatPrice((unitPrice + optionsTotal) * qty)}
                    style={{
                      color: AppColors.white,
                      fontSize: sp(16),
                      fontWeight: '700',
                    }}
                  />
                  {hasDiscount && (
                    <BaseTextRaw
                      text={formatPrice(originalPrice * qty)}
                      style={{
                        color: `${AppColors.white}B3`, // ~0.7 opacity
                        fontSize: sp(13),
                        fontWeight: '500',
                        textDecorationLine: 'line-through',
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Space for bottom bar */}
            <View style={{ height: h(100) }} />
          </View>
        </ScrollView>

        {/* Bottom mini-cart bar — only shown once the cart actually has items.
            Tapping it slides a preview of the cart up instead of jumping
            straight to the cart tab. */}
        {cartHasItems && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.bottomBar}
            onPress={() => setCartSheetOpen(true)}
          >
            <View style={styles.bottomBarSide}>
              <Ionicons name="cart-outline" size={sp(22)} color={AppColors.white} />
              <View style={{ width: w(10) }} />
              <BaseTextRaw
                text={t('items_in_cart', { count: cartSummary.items_count })}
                style={{ color: AppColors.white, fontSize: sp(15), fontWeight: '600' }}
              />
            </View>
            <View style={styles.bottomBarSide}>
              <BaseTextRaw
                text={formatPrice(cartSummary.subtotal)}
                style={{ color: AppColors.white, fontSize: sp(16), fontWeight: 'bold' }}
              />
              <View style={{ width: w(8) }} />
              <Ionicons name="chevron-up" size={sp(20)} color={AppColors.white} />
            </View>
          </TouchableOpacity>
        )}

        {/* Slide-up mini-cart preview. Backdrop tap (or chevron) closes it; the
            inner Pressable swallows taps so they don't bubble to the backdrop. */}
        <Modal
          visible={cartSheetOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setCartSheetOpen(false)}
        >
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setCartSheetOpen(false)}
          >
            <Pressable
              style={[styles.sheetPanel, { paddingBottom: insets.bottom + h(16) }]}
              onPress={() => {}}
            >
              <View style={styles.grabber} />

              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.bottomBarSide}>
                  <Ionicons
                    name="cart-outline"
                    size={sp(22)}
                    color={AppColors.primaryColor}
                  />
                  <View style={{ width: w(10) }} />
                  <BaseTextRaw
                    text={t('items_in_cart', { count: cartSummary.items_count })}
                    style={{
                      color: AppColors.textColorTheme,
                      fontSize: sp(16),
                      fontWeight: '700',
                    }}
                  />
                </View>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => setCartSheetOpen(false)}
                >
                  <Ionicons
                    name="chevron-down"
                    size={sp(24)}
                    color={AppColors.textColor2}
                  />
                </TouchableOpacity>
              </View>

              {/* Item thumbnails with quantity badges */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbRow}
              >
                {cartItems.map((it, idx) => (
                  <View key={String(it.product_id ?? idx)} style={styles.thumbWrap}>
                    <Image
                      source={{ uri: it.image || '' }}
                      style={styles.thumb}
                      contentFit="cover"
                    />
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyBadgeText}>{it.qty}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Footer: total + view full cart */}
              <View style={styles.sheetFooter}>
                <View>
                  <BaseTextRaw
                    text={t('total')}
                    style={{
                      color: AppColors.textColor2,
                      fontSize: sp(13),
                      fontWeight: '500',
                    }}
                  />
                  <BaseTextRaw
                    text={formatPrice(cartSummary.subtotal)}
                    style={{
                      color: AppColors.textColorTheme,
                      fontSize: sp(20),
                      fontWeight: '700',
                    }}
                  />
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.viewCartBtn}
                  onPress={openFullCart}
                >
                  <BaseTextRaw
                    text={t('view_cart')}
                    style={{
                      color: AppColors.white,
                      fontSize: sp(16),
                      fontWeight: '700',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// Small inline text helper (keeps style array semantics close to Flutter Text).
// Picks the Quicksand family that matches the style's fontWeight.
function BaseTextRaw({ text, style }: { text: string; style?: TextStyle }) {
  return (
    <Text style={[{ fontFamily: quicksand(style?.fontWeight) }, style]}>
      {text}
    </Text>
  );
}

function BaseOptionText({
  text,
  color,
  weight,
}: {
  text: string;
  color: string;
  weight: TextStyle['fontWeight'];
}) {
  return (
    <Text style={{ fontSize: sp(15), fontFamily: quicksand(weight), color }}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  root: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImageWrap: {
    height: h(300),
    width: '100%',
  },
  headerImage: {
    height: h(300),
    width: '100%',
  },
  leadingBtn: {
    position: 'absolute',
    top: h(8),
    left: w(8),
    margin: w(8),
    backgroundColor: `${AppColors.black}80`, // 0.5 opacity
    borderRadius: 999,
    width: w(36),
    height: w(36),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  actionBtn: {
    position: 'absolute',
    top: h(8),
    right: w(8),
    margin: w(8),
    backgroundColor: `${AppColors.black}80`, // 0.5 opacity
    borderRadius: 999,
    width: w(36),
    height: w(36),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  indicatorsRow: {
    position: 'absolute',
    bottom: h(16),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: w(8),
    height: w(8),
    borderRadius: 999,
  },
  body: {
    padding: w(16),
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: `${AppColors.lightGray}80`, // 0.5 opacity
  },
  optionTile: {
    marginBottom: h(12),
    paddingHorizontal: w(16),
    paddingVertical: h(16),
    borderRadius: r(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTileMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupHintPill: {
    paddingHorizontal: w(10),
    paddingVertical: h(3),
    borderRadius: r(12),
    backgroundColor: AppColors.lightGrey,
  },
  groupHintPillRequired: {
    backgroundColor: `${AppColors.errorColor}1A`, // ~0.1 opacity
  },
  groupHintText: {
    fontSize: sp(11),
    fontFamily: quicksand('600'),
  },
  noteInput: {
    minHeight: h(84),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(8),
    paddingHorizontal: w(14),
    paddingVertical: h(12),
    fontSize: sp(14),
    fontFamily: quicksand('500'),
    color: AppColors.textColorTheme,
    textAlignVertical: 'top',
    backgroundColor: AppColors.white,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.lightGrey,
    borderRadius: r(12),
    paddingHorizontal: w(4),
    marginRight: w(12),
  },
  stepperBtn: {
    width: w(40),
    height: h(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    minWidth: w(24),
    textAlign: 'center',
    fontSize: sp(16),
    fontFamily: quicksand('700'),
    color: AppColors.textColorTheme,
  },
  addToCartBtn: {
    flex: 1,
    height: h(52),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(20),
  },
  bottomBar: {
    position: 'absolute',
    bottom: h(20),
    left: w(16),
    right: w(16),
    paddingHorizontal: w(16),
    paddingVertical: h(12),
    backgroundColor: AppColors.darkTeal, // Dark Teal
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
  bottomBarSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // ---- Slide-up mini-cart sheet ----
  sheetBackdrop: {
    flex: 1,
    backgroundColor: `${AppColors.black}66`, // ~0.4 opacity scrim
    justifyContent: 'flex-end',
  },
  sheetPanel: {
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
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: h(16),
  },
  thumbRow: {
    paddingVertical: h(4),
    paddingRight: w(8),
  },
  thumbWrap: {
    width: w(64),
    height: w(64),
    marginRight: w(10),
  },
  thumb: {
    width: w(64),
    height: w(64),
    borderRadius: r(10),
    backgroundColor: AppColors.lightGrey,
  },
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
  qtyBadgeText: {
    color: AppColors.white,
    fontSize: sp(11),
    fontFamily: quicksand('700'),
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: h(20),
  },
  viewCartBtn: {
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(14),
    paddingHorizontal: w(28),
    height: h(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
