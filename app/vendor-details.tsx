// Ported from Flutter:
//   lib/screens/vendor/vendor_details_screen.dart  (VendorDetailsScreen)
// Real backend data: branch (or vendor) via navArgs; subcategories + products from the store.
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { t } from '@/i18n';
import { AppImage, BaseText } from '@/components';
import {
  PromotionCard,
  PopularItemCard,
  MenuListItemCard,
} from '@/components/cards';
import { navArgs, useNavArgs } from '@/store/navArgs';
import { useBranchesStore } from '@/features/branches/branchesStore';
import { useProductStore } from '@/features/categories/productStore';
import { useCartStore } from '@/features/cart/cartStore';
import { formatPrice } from '@/lib/currency';
import { showSnack } from '@/lib/snack';
import { BranchModel } from '@/types/branch';
import { VendorModel } from '@/types/vendor';
import { ProductModel } from '@/types/product';

export default function VendorDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const args = useNavArgs((s) => s.args);

  const argBranch = args.branch as BranchModel | undefined;
  const argVendor = args.vendor as VendorModel | undefined;

  const vendorBranches = useBranchesStore((s) => s.vendorBranches);
  const subcategories = useProductStore((s) => s.subcategories);
  const products = useProductStore((s) => s.products);
  const isLoading = useProductStore((s) => s.isLoading);

  // Bottom bar reflects the real cart: item count + subtotal.
  const cartSummary = useCartStore((s) => s.summary);
  const cartHasItems = cartSummary.items_count > 0;

  const [favorite, setFavorite] = useState(false);

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out ${argBranch?.name ?? argVendor?.name ?? 'this shop'} on Jawlah!`,
      });
    } catch {
      // user dismissed / share unavailable
    }
  };

  // Resolve the active branch: passed directly, or the first vendor branch.
  const branch: BranchModel | undefined =
    argBranch ?? (argVendor ? vendorBranches[0] : undefined);

  // If only a vendor is passed, fetch its branches.
  useEffect(() => {
    if (!argBranch && argVendor?.id != null) {
      useBranchesStore.getState().getVendorBranches(argVendor.id as any);
    }
  }, [argBranch, argVendor?.id]);

  // Load subcategories (tabs) + products once a branch is known.
  useEffect(() => {
    if (branch?.id != null) {
      useProductStore.getState().getBranchSubcategories(branch.id as any);
      useProductStore.getState().getBranchProducts(branch.id as any);
    }
  }, [branch?.id]);

  // Keep the bottom "view cart" count in sync.
  useEffect(() => {
    useCartStore.getState().loadCart();
  }, []);

  // selected tab index state
  const [tabIndex, setTabIndex] = useState(0);

  // _menuCategories from backend subcategories.
  const menuCategories: string[] = useMemo(
    () => subcategories.map((s) => s.name ?? ''),
    [subcategories],
  );

  // When a subcategory tab is selected, narrow the product list.
  const onSelectTab = (index: number) => {
    setTabIndex(index);
    const sub = subcategories[index];
    if (branch?.id != null && sub?.id != null) {
      useProductStore
        .getState()
        .getSubcategoryProducts(branch.id as any, sub.id as any);
    }
  };

  const openProduct = (product: ProductModel) => {
    navArgs.set({ product, branch });
    router.push('/product-details');
  };

  const buildBadge = (text: string) => (
    <View style={styles.badge}>
      <BaseText
        title={text}
        style={{ fontSize: sp(12), fontFamily: quicksand('500') }}
      />
    </View>
  );

  // Wait for a branch to resolve (e.g. vendor branches still loading).
  if (!branch) {
    return (
      <SafeAreaView style={styles.scaffold} edges={['bottom']}>
        <View style={[styles.scaffold, styles.center]}>
          <ActivityIndicator color={AppColors.primaryColor} />
        </View>
      </SafeAreaView>
    );
  }

  const headerTitle = branch.name ?? argVendor?.name ?? '';
  const ratingText = `${branch.rating ?? 0} (${branch.reviewsCount ?? 0}+ ${t(
    'reviews',
  )})`;
  const deliveryTimeText = branch.deliveryTime ?? '';
  const aboutText = argVendor?.description ?? branch.vendorName ?? '';
  const popularProducts = products.slice(0, 3);

  return (
    // Scaffold(backgroundColor: AppColors.white)
    <SafeAreaView style={styles.scaffold} edges={['bottom']}>
      {/* Stack */}
      <View style={{ flex: 1 }}>
        {/* CustomScrollView */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 0 }}
        >
          {/* SliverAppBar - Header Image with Back Button */}
          <View style={styles.sliverAppBar}>
            {/* flexibleSpace background */}
            <AppImage
              source={branch.image ?? ''}
              width={undefined as unknown as number}
              height={h(200)}
              contentFit="cover"
              style={styles.headerImage}
            />
            {/* LinearGradient(top->bottom: black 0.26 -> transparent).
                expo-linear-gradient not available; approximate top-down
                dark overlay with a plain semi-transparent View. */}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(48,57,67,0.18)' },
              ]}
            />
            {/* leading (back) */}
            <View style={[styles.leadingWrap, { top: insets.top + h(8) }]}>
              <Pressable
                style={styles.circleBtn}
                hitSlop={8}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="arrow-back"
                  color={AppColors.black}
                  size={sp(20)}
                />
              </Pressable>
            </View>
            {/* actions (favorite + share) */}
            <View style={[styles.actionsWrap, { top: insets.top + h(8) }]}>
              <Pressable
                style={styles.circleBtn}
                hitSlop={8}
                onPress={() => {
                  setFavorite((v) => !v);
                  showSnack(favorite ? t('removed_from_favorites') : t('added_to_favorites'), 'success');
                }}
              >
                <Ionicons
                  name={favorite ? 'heart' : 'heart-outline'}
                  color={favorite ? AppColors.red : AppColors.black}
                  size={sp(20)}
                />
              </Pressable>
              <View style={{ width: w(8) }} />
              <Pressable
                style={[styles.circleBtn, { marginRight: w(8) }]}
                hitSlop={8}
                onPress={onShare}
              >
                <Ionicons
                  name="share-social"
                  color={AppColors.black}
                  size={sp(20)}
                />
              </Pressable>
            </View>
          </View>

          {/* SliverToBoxAdapter */}
          <View style={{ paddingHorizontal: w(16) }}>
            {/* Space for overlapping logo */}
            <View style={{ height: h(16) }} />

            {/* Header Info */}
            <View style={styles.headerInfoRow}>
              <View style={styles.logoCircle}>
                <AppImage
                  source={argVendor?.logoUrl ?? branch.image ?? ''}
                  width={w(60)}
                  height={w(60)}
                  contentFit="cover"
                  borderRadius={w(30)}
                  style={{ width: w(60), height: w(60) }}
                />
              </View>
              <View style={{ width: w(12) }} />
              <View style={{ flex: 1 }}>
                <BaseText
                  title={headerTitle}
                  style={{
                    fontSize: sp(20),
                    fontFamily: quicksand('bold'),
                    color: AppColors.textColorTheme,
                  }}
                />
                <View style={{ height: h(4) }} />
                <View style={styles.infoRow}>
                  <MaterialIcons
                    name="access-time"
                    size={sp(14)}
                    color={AppColors.textColor2}
                  />
                  <View style={{ width: w(4) }} />
                  <BaseText
                    title={deliveryTimeText}
                    style={{ fontSize: sp(12), color: AppColors.textColor2 }}
                  />
                  <View style={{ flex: 1 }} />
                  <MaterialIcons
                    name="star"
                    size={sp(16)}
                    color={AppColors.lightOrange}
                  />
                  <BaseText
                    title={` ${ratingText}`}
                    style={{
                      fontSize: sp(12),
                      color: AppColors.textColorTheme,
                      fontFamily: quicksand('600'),
                    }}
                  />
                </View>
              </View>
            </View>
            <View style={{ height: h(16) }} />

            {/* Badges */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View style={{ flexDirection: 'row' }}>
                {branch.freeDelivery && buildBadge(t('free_delivery'))}
                {branch.freeDelivery && <View style={{ width: w(8) }} />}
                {branch.isOpen && buildBadge(t('open_now'))}
              </View>
            </ScrollView>
            <View style={{ height: h(20) }} />

            {/* About Section */}
            <BaseText
              title={t('about')}
              style={{
                fontSize: sp(16),
                fontFamily: quicksand('bold'),
                color: AppColors.textColorTheme,
              }}
            />
            <View style={{ height: h(8) }} />
            <BaseText
              title={aboutText}
              style={{ fontSize: sp(13), color: AppColors.textColor2 }}
            />
            <View style={{ height: h(16) }} />

            {/* Location Card */}
            <View style={styles.locationCard}>
              <View style={styles.minimap}>
                <AppImage
                  source={branch.image ?? ''}
                  width={w(40)}
                  height={w(40)}
                  contentFit="cover"
                  borderRadius={r(8)}
                  style={{ width: w(40), height: w(40) }}
                />
              </View>
              <View style={{ width: w(12) }} />
              <View style={{ flex: 1 }}>
                <BaseText
                  title={
                    [branch.address, branch.city].filter(Boolean).join(', ')
                  }
                  style={{ fontSize: sp(14), fontFamily: quicksand('500') }}
                />
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                size={sp(14)}
                color={AppColors.textColor2}
              />
            </View>
            <View style={{ height: h(24) }} />

            {/* Promotions */}
            <BaseText
              title={t('promotions')}
              style={{
                fontSize: sp(16),
                fontFamily: quicksand('bold'),
                color: AppColors.textColorTheme,
              }}
            />
            <View style={{ height: h(12) }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row' }}>
                <PromotionCard
                  title={`20% ${t('off').toUpperCase()}`}
                  description="On your first order with Jawlah"
                  code="WELCOME20"
                  backgroundColor={AppColors.darkTeal}
                />
                <PromotionCard
                  title={`${t('free_delivery').toUpperCase()}`}
                  description={`On orders above ${formatPrice(50000)}`}
                  code="FREEDEL"
                  backgroundColor={AppColors.darkTeal}
                />
              </View>
            </ScrollView>
            <View style={{ height: h(24) }} />

            {/* Tabs (TabBar) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tabBar}>
                {menuCategories.map((e, index) => {
                  const selected = index === tabIndex;
                  return (
                    <Pressable
                      key={`${e}-${index}`}
                      onPress={() => onSelectTab(index)}
                      style={styles.tab}
                    >
                      <BaseText
                        title={e}
                        style={{
                          fontFamily: quicksand(selected ? 'bold' : '500'),
                          fontSize: selected ? sp(16) : sp(15),
                          color: selected
                            ? AppColors.primaryColor
                            : AppColors.textColor2,
                        }}
                      />
                      <View style={{ height: h(6) }} />
                      <View
                        style={{
                          height: 2,
                          width: '100%',
                          backgroundColor: selected
                            ? AppColors.primaryColor
                            : AppColors.transparent,
                        }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <View style={{ height: h(16) }} />
            {/* Divider(height: 1) */}
            <View style={styles.divider} />
            <View style={{ height: h(24) }} />

            {/* Most Popular */}
            <View style={styles.spaceBetweenRow}>
              <BaseText
                title={t('most_popular')}
                style={{ fontSize: sp(18), fontFamily: quicksand('bold') }}
              />
              <BaseText
                title={t('view_all')}
                style={{ fontSize: sp(14), color: AppColors.textColor2 }}
              />
            </View>
            <View style={{ height: h(16) }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row' }}>
                {popularProducts.map((product, index) => (
                  <PopularItemCard
                    key={String(product.id ?? index)}
                    name={product.name ?? ''}
                    description={product.description ?? ''}
                    price={formatPrice(product.finalPrice ?? product.price)}
                    imageUrl={product.imageUrl ?? ''}
                    onAdd={() => openProduct(product)}
                  />
                ))}
              </View>
            </ScrollView>
            <View style={{ height: h(24) }} />

            {/* Category Header for List */}
            <BaseText
              title={menuCategories[tabIndex] ?? t('most_popular')}
              style={{ fontSize: sp(18), fontFamily: quicksand('bold') }}
            />
            <View style={{ height: h(16) }} />
          </View>

          {/* SliverPadding + SliverList - Vertical List */}
          <View style={{ paddingHorizontal: w(16) }}>
            {isLoading && products.length === 0 ? (
              <ActivityIndicator
                style={{ marginTop: h(20) }}
                color={AppColors.primaryColor}
              />
            ) : products.length === 0 ? (
              <BaseText
                title={t('no_orders')}
                style={{
                  textAlign: 'center',
                  marginTop: h(20),
                  color: AppColors.textColor2,
                }}
              />
            ) : (
              products.map((product, index) => (
                <MenuListItemCard
                  key={String(product.id ?? index)}
                  name={product.name ?? ''}
                  description={product.description ?? ''}
                  price={formatPrice(product.finalPrice ?? product.price)}
                  imageUrl={product.imageUrl ?? ''}
                  onAdd={() => openProduct(product)}
                  onPress={() => openProduct(product)}
                />
              ))
            )}
          </View>

          {/* SliverToBoxAdapter - Space for bottom cart */}
          <View style={{ height: h(80) }} />
        </ScrollView>

        {/* Bottom Cart Button (Positioned) */}
        <View style={styles.bottomCartWrap}>
          <Pressable
            style={({ pressed }) => [
              styles.bottomCart,
              !cartHasItems && { justifyContent: 'center' },
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => router.push('/(tabs)/cart')}
          >
            {cartHasItems && (
              <View style={styles.cartBadge}>
                <BaseText
                  title={String(cartSummary.items_count)}
                  style={{
                    color: AppColors.darkTeal,
                    fontSize: sp(13),
                    fontFamily: quicksand('bold'),
                  }}
                />
              </View>
            )}
            <BaseText
              title={t('view_cart')}
              style={{
                color: AppColors.white,
                fontSize: sp(16),
                fontFamily: quicksand('bold'),
              }}
            />
            {cartHasItems && (
              <BaseText
                title={formatPrice(cartSummary.subtotal)}
                style={{
                  color: AppColors.white,
                  fontSize: sp(16),
                  fontFamily: quicksand('bold'),
                }}
              />
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scaffold: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliverAppBar: {
    height: h(200),
    backgroundColor: AppColors.primaryColor,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: h(200),
  },
  leadingWrap: {
    position: 'absolute',
    top: h(8),
    left: w(8),
    zIndex: 10,
    elevation: 10,
  },
  actionsWrap: {
    position: 'absolute',
    top: h(8),
    right: w(8),
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  circleBtn: {
    width: w(40),
    height: w(40),
    borderRadius: w(20),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoCircle: {
    width: w(60),
    height: w(60),
    borderRadius: w(30),
    borderWidth: 2,
    borderColor: AppColors.white,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: w(12),
    paddingVertical: h(6),
    backgroundColor: 'rgba(239,242,245,0.5)', // lightGreyV2 @ 0.5
    borderRadius: r(20),
  },
  locationCard: {
    padding: w(12),
    backgroundColor: 'rgba(239,242,245,0.3)', // lightGreyV2 @ 0.3
    borderRadius: r(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  minimap: {
    width: w(40),
    height: w(40),
    backgroundColor: AppColors.white,
    borderRadius: r(8),
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tab: {
    alignItems: 'center',
    marginRight: w(20),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  spaceBetweenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomCartWrap: {
    position: 'absolute',
    bottom: h(20),
    left: w(16),
    right: w(16),
  },
  bottomCart: {
    paddingHorizontal: w(16),
    paddingVertical: h(12),
    backgroundColor: AppColors.darkTeal,
    borderRadius: r(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.26,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cartBadge: {
    minWidth: w(24),
    height: w(24),
    paddingHorizontal: w(6),
    borderRadius: r(12),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
