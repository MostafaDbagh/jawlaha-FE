// Ported from: lib/screens/categories/product_details_screen.dart
// Real backend data: product + branch passed via navArgs; variations as options.
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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
import { ProductModel, ProductVariation } from '@/types/product';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const args = useNavArgs((s) => s.args);

  const currentProduct = useProductStore((s) => s.currentProduct);
  const isLoading = useProductStore((s) => s.isLoading);

  // The bottom bar reflects the real cart, not the local stepper — so it shows
  // no price until the user has actually added something to the cart.
  const cartSummary = useCartStore((s) => s.summary);
  const cartHasItems = cartSummary.items_count > 0;

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

  const [selectedVariationId, setSelectedVariationId] = useState<
    string | number | null
  >(null);
  const [qty, setQty] = useState(1);
  const [favorite, setFavorite] = useState(false);

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
    const res = await useCartStore.getState().addItem({
      product_id: product.id as any,
      qty,
      variation_id: (selectedVariationId ?? null) as any,
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
                    text={formatPrice(unitPrice * qty)}
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

        {/* Bottom View Cart Bar — price only appears once the cart has items. */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.bottomBar,
            !cartHasItems && { justifyContent: 'center' },
          ]}
          onPress={() => router.push('/(tabs)/cart')}
        >
          {cartHasItems && (
            <BaseTextRaw
              text={formatPrice(cartSummary.subtotal)}
              style={{
                color: AppColors.white,
                fontSize: sp(16),
                fontWeight: '600',
              }}
            />
          )}
          <BaseTextRaw
            text={t('view_cart')}
            style={{
              color: AppColors.white,
              fontSize: sp(16),
              fontWeight: 'bold',
            }}
          />
        </TouchableOpacity>
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
});
