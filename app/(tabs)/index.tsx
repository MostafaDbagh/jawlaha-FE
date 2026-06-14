// Home tab — Keeta-style: Categories -> Offers for you -> Popular brands -> Restaurants.
// The search bar type-filters the categories / brands / restaurant lists.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  RefreshControl,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { Responsive } from '@/theme/responsive';
import { t, useI18n } from '@/i18n';
import { BaseText } from '@/components';
import {
  LocationHeader,
  CustomSearchBar,
  SectionHeader,
  CategoryCard,
  RestaurantRowCard,
} from '@/components/cards';
import type { RestaurantBadge } from '@/components/cards/RestaurantRowCard';
import { cuisineLabels } from '@/lib/cuisines';
import { navArgs } from '@/store/navArgs';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/features/cart/cartStore';
import { useHomeStore } from '@/features/home/homeStore';
import { useCityStore } from '@/features/location/cityStore';
import { cityLabel } from '@/lib/cities';
import type { BranchModel } from '@/types/branch';

// A faint food icon is stamped behind each offer card to give it life. The
// icon is guessed from the offer's title/description (Arabic + English) so a
// shawarma deal shows a kebab, a pizza deal a pizza, etc.
type OfferIcon =
  | { lib: 'mi'; name: keyof typeof MaterialIcons.glyphMap }
  | { lib: 'mci'; name: keyof typeof MaterialCommunityIcons.glyphMap };

function offerWatermarkIcon(offer: {
  title?: string;
  description?: string;
}): OfferIcon {
  const s = `${offer.title ?? ''} ${offer.description ?? ''}`.toLowerCase();
  const has = (...kw: string[]) => kw.some((k) => s.includes(k));
  if (has('pizza', 'بيتزا')) return { lib: 'mci', name: 'pizza' };
  if (has('shawarma', 'شاورما', 'kebab', 'كباب', 'wrap', 'مشاوي', 'مشوي', 'grill', 'مشكل'))
    return { lib: 'mi', name: 'kebab-dining' };
  if (has('burger', 'sandwich', 'برجر', 'برغر', 'ساندويش', 'ساندويتش'))
    return { lib: 'mci', name: 'hamburger' };
  if (has('sweet', 'dessert', 'cake', 'حلو', 'حلويات', 'كيك', 'كنافة', 'بقلاوة', 'mezze', 'مزة'))
    return { lib: 'mci', name: 'cupcake' };
  if (has('coffee', 'drink', 'juice', 'قهوة', 'مشروب', 'عصير', 'مشروبات'))
    return { lib: 'mci', name: 'coffee' };
  if (has('chicken', 'broast', 'دجاج', 'فروج', 'بروست'))
    return { lib: 'mci', name: 'food-drumstick' };
  if (has('rice', 'mandi', 'biryani', 'أرز', 'رز', 'مندي', 'برياني', 'كبسة'))
    return { lib: 'mci', name: 'rice' };
  if (has('pasta', 'noodle', 'معكرونة', 'باستا', 'نودلز'))
    return { lib: 'mci', name: 'noodles' };
  return { lib: 'mci', name: 'silverware-fork-knife' };
}

function OfferWatermark({ offer }: { offer: { title?: string; description?: string } }) {
  const ic = offerWatermarkIcon(offer);
  return ic.lib === 'mci' ? (
    <MaterialCommunityIcons
      name={ic.name}
      size={r(48)}
      color="rgba(255,255,255,0.18)"
      style={styles.offerWatermark}
    />
  ) : (
    <MaterialIcons
      name={ic.name}
      size={r(48)}
      color="rgba(255,255,255,0.18)"
      style={styles.offerWatermark}
    />
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const { lang, isRTL } = useI18n();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const cartCount = useCartStore((s) => s.summary.items_count);
  const city = useCityStore((s) => s.city);
  const cityHydrated = useCityStore((s) => s.hydrated);

  // Keep the header basket badge in sync with the server cart.
  useEffect(() => {
    if (isLoggedIn) useCartStore.getState().loadCart();
  }, [isLoggedIn]);

  const addressTitle = useHomeStore((s) => s.addressTitle);
  const banners = useHomeStore((s) => s.banners);
  const categories = useHomeStore((s) => s.categories);
  const isCategoriesLoading = useHomeStore((s) => s.isCategoriesLoading);
  const popularVendors = useHomeStore((s) => s.popularVendors);
  const nearbyBranches = useHomeStore((s) => s.nearbyBranches);
  const isNearbyBranchesLoading = useHomeStore((s) => s.isNearbyBranchesLoading);

  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [offerIndex, setOfferIndex] = useState(0);

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const filteredCategories = useMemo(() => {
    // De-duplicate by id (guards against a double-load appending the same page).
    const seen = new Set<string>();
    const unique = categories.filter((c) => {
      const id = String(c.id ?? c.name);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return !q ? unique : unique.filter((c) => (c.name ?? '').toLowerCase().includes(q));
  }, [categories, q]);
  const filteredBrands = useMemo(() => {
    // Only brands that actually have a branch in the selected city, so the home
    // never surfaces a restaurant from another city.
    const inCity = popularVendors.filter((v) =>
      nearbyBranches.some((b) => b.vendorName === v.name),
    );
    return !q
      ? inCity
      : inCity.filter((v) =>
          [v.name, v.description].some((f) => (f ?? '').toLowerCase().includes(q)),
        );
  }, [popularVendors, nearbyBranches, q]);
  const filteredBranches = useMemo(() => {
    const list = !q
      ? nearbyBranches
      : nearbyBranches.filter((b) =>
          [b.name, b.vendorName, b.city].some((f) => (f ?? '').toLowerCase().includes(q)),
        );
    // Admin-featured restaurants lead the list (stable otherwise). The backend
    // already returns them first; re-sorting here keeps the order after the
    // city/search filter and survives any future client-side reordering.
    return [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }, [nearbyBranches, q]);

  useEffect(() => {
    useHomeStore.getState().getHomeData();
  }, []);

  // Re-fetch restaurants whenever the selected city changes (incl. first pick).
  useEffect(() => {
    useHomeStore.getState().getNearbyBranches();
  }, [city]);

  // First-run nudge: once we know there's no saved city, ask a signed-in user to
  // pick one (guests are routed to login by the header instead).
  const promptedCity = useRef(false);
  useEffect(() => {
    if (cityHydrated && !city && isLoggedIn && !promptedCity.current) {
      promptedCity.current = true;
      router.push('/select-city');
    }
  }, [cityHydrated, city, isLoggedIn, router]);

  const onRefresh = async () => {
    setRefreshing(true);
    await useHomeStore.getState().getHomeData();
    setRefreshing(false);
  };

  const responsivePadding = Responsive.getResponsivePadding();

  const openBranch = (branch: BranchModel) => {
    navArgs.set({ branch });
    router.push('/vendor-details');
  };

  const badgesFor = (branch: BranchModel): RestaurantBadge[] => {
    const badges: RestaurantBadge[] = [];
    if (branch.isFeatured) badges.push({ text: t('featured'), type: 'featured' });
    if (branch.freeDelivery) badges.push({ text: t('free_delivery'), type: 'free' });
    return badges;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* The restaurants list is virtualized; all the sections above it live in
          ListHeaderComponent so the home feed scrolls as one list. */}
      <FlatList
        data={filteredBranches}
        keyExtractor={(item, i) => `rest-${item.id ?? i}`}
        renderItem={({ item: branch }) => (
          <RestaurantRowCard
            name={branch.name ?? ''}
            image={branch.image}
            cuisine={cuisineLabels(branch.cuisines) || (branch.city ?? '')}
            deliveryTime={branch.deliveryTime}
            distanceKm={branch.distanceKm}
            freeDelivery={branch.freeDelivery}
            badges={badgesFor(branch)}
            onPress={() => openBranch(branch)}
          />
        )}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingHorizontal: responsivePadding.paddingHorizontal,
          paddingBottom: h(24),
        }}
        initialNumToRender={6}
        windowSize={11}
        removeClippedSubviews
        ListHeaderComponent={
          <>
        <View style={{ height: h(10) }} />
        <LocationHeader
          address={city ? cityLabel(city, lang) : addressTitle}
          onPressLocation={isLoggedIn ? () => router.push('/select-city') : undefined}
          onPressNotifications={() => router.push('/notifications')}
          onPressCart={() => router.push(isLoggedIn ? '/(tabs)/cart' : '/login')}
          cartCount={cartCount}
          onPressLogin={isLoggedIn ? undefined : () => router.push('/login')}
        />
        <View style={{ height: h(16) }} />
        <View style={styles.fullWidth}>
          <CustomSearchBar
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Jawlaha Services — non-restaurant services (currently the errand
            "Box"); hidden while searching restaurants. */}
        {!isSearching && (
          <>
            <View style={{ height: h(20) }} />
            <SectionHeader title={t('jawlaha_services')} />
            <View style={{ height: h(12) }} />
            <Pressable
              style={styles.boxCard}
              onPress={() => router.push(isLoggedIn ? '/jawlaha-box' : '/login')}
            >
              <View style={styles.boxIconWrap}>
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={sp(26)}
                  color={AppColors.white}
                />
              </View>
              <View style={{ width: w(12) }} />
              <View style={{ flex: 1 }}>
                <BaseText
                  title={t('box_home_card_title')}
                  size={sp(16)}
                  fontWeight="700"
                  color={AppColors.white}
                  numberOfLines={1}
                />
                <View style={{ height: h(2) }} />
                <BaseText
                  title={t('box_home_card_subtitle')}
                  size={sp(12)}
                  color="rgba(255,255,255,0.9)"
                  numberOfLines={1}
                />
              </View>
              <MaterialIcons
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={sp(26)}
                color={AppColors.white}
              />
            </Pressable>
          </>
        )}

        {/* 1. Categories */}
        {(isCategoriesLoading || filteredCategories.length > 0) && (
          <>
            <View style={{ height: h(20) }} />
            <SectionHeader title={t('categories')} />
            <View style={{ height: h(12) }} />
            <View style={{ height: h(96) }}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={filteredCategories}
                keyExtractor={(item, i) => `cat-${item.id ?? 'x'}-${i}`}
                ItemSeparatorComponent={() => <View style={{ width: w(16) }} />}
                renderItem={({ item: c }) => (
                  <CategoryCard
                    imageUrl={c.imageUrl}
                    icon="restaurant"
                    label={c.name ?? ''}
                    onPress={() => {
                      navArgs.set({ categoryId: c.id, categoryName: c.name });
                      router.push('/sub-categories');
                    }}
                  />
                )}
              />
            </View>
          </>
        )}

        {/* 2. Offers for you (hidden while searching) */}
        {!isSearching && banners.length > 0 && (
          <>
            <View style={{ height: h(20) }} />
            <SectionHeader title={t('offers_for_you')} onViewAllTap={() => router.push('/all-vendors')} />
            <View style={{ height: h(12) }} />
            <View style={{ height: h(120) }}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={banners}
                keyExtractor={(item, i) => `offer-${item.id ?? i}`}
                ItemSeparatorComponent={() => <View style={{ width: w(12) }} />}
                onMomentumScrollEnd={(e) =>
                  setOfferIndex(
                    Math.round(e.nativeEvent.contentOffset.x / (w(220) + w(12))),
                  )
                }
                renderItem={({ item: o }) => (
                  <Pressable onPress={() => router.push('/all-vendors')} style={styles.offerCard}>
                    <OfferWatermark offer={o} />
                    <View style={styles.offerDiscountPill}>
                      <BaseText title={`${o.discountValue ?? 0}% ${t('off')}`} style={styles.offerDiscountText} />
                    </View>
                    <View style={{ height: h(8) }} />
                    <BaseText title={o.title ?? ''} numberOfLines={1} style={styles.offerTitle} />
                    <BaseText title={o.description ?? ''} numberOfLines={2} style={styles.offerDesc} />
                  </Pressable>
                )}
              />
            </View>

            {/* Pagination dots — active page is a wider teal pill. */}
            {banners.length > 1 && (
              <View style={styles.dotsRow}>
                {banners.map((b, i) => (
                  <View
                    key={`offer-dot-${b.id ?? i}`}
                    style={[styles.dot, i === offerIndex ? styles.dotActive : styles.dotInactive]}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* 3. Popular brands */}
        {filteredBrands.length > 0 && (
          <>
            <View style={{ height: h(20) }} />
            <SectionHeader title={t('popular_brands')} onViewAllTap={() => router.push('/all-vendors')} />
            <View style={{ height: h(12) }} />
            <View style={{ height: h(80) }}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={filteredBrands}
                keyExtractor={(item, i) => `brand-${item.id ?? i}`}
                ItemSeparatorComponent={() => <View style={{ width: w(12) }} />}
                renderItem={({ item: v }) => (
                  <Pressable
                    style={styles.brandTile}
                    onPress={() => {
                      const branch = nearbyBranches.find((b) => b.vendorName === v.name);
                      if (branch) openBranch(branch);
                      else {
                        navArgs.set({ vendor: v });
                        router.push('/vendor-details');
                      }
                    }}
                  >
                    {v.image || v.logoUrl ? (
                      <Image source={{ uri: v.image ?? v.logoUrl }} style={styles.brandLogo} contentFit="cover" transition={0} />
                    ) : (
                      <MaterialIcons name="storefront" size={sp(28)} color={AppColors.primaryColor} />
                    )}
                  </Pressable>
                )}
              />
            </View>
          </>
        )}

        {/* Restaurants are city-scoped — prompt a signed-in user with no city. */}
        {isLoggedIn && cityHydrated && !city && (
          <Pressable style={styles.cityPrompt} onPress={() => router.push('/select-city')}>
            <MaterialIcons name="location-city" size={sp(30)} color={AppColors.primaryColor} />
            <View style={{ height: h(8) }} />
            <BaseText title={t('select_city_title')} style={styles.cityPromptTitle} textAlign="center" />
            <BaseText title={t('select_city_subtitle')} style={styles.cityPromptSub} textAlign="center" />
            <View style={{ height: h(12) }} />
            <View style={styles.cityPromptBtn}>
              <BaseText title={t('select_city')} style={styles.cityPromptBtnText} />
            </View>
          </Pressable>
        )}

        {/* 4. Restaurants — every restaurant on the platform (not city-scoped).
            The rows themselves are the FlatList data; this just renders the
            section header above them. */}
        {(isNearbyBranchesLoading || filteredBranches.length > 0) && (
          <>
            <View style={{ height: h(20) }} />
            <SectionHeader title={t('restaurants')} onViewAllTap={() => router.push('/all-vendors')} />
            <View style={{ height: h(12) }} />
          </>
        )}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.white },
  fullWidth: { width: '100%' },
  boxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: w(14),
    borderRadius: r(14),
    backgroundColor: AppColors.primaryColor,
    overflow: 'hidden',
  },
  boxIconWrap: {
    width: w(44),
    height: w(44),
    borderRadius: r(12),
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityPrompt: {
    marginTop: h(28),
    alignItems: 'center',
    padding: w(20),
    borderRadius: r(16),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    backgroundColor: AppColors.whiteApplication,
  },
  cityPromptTitle: { fontSize: sp(16), fontFamily: quicksand('700'), color: AppColors.textColorTheme },
  cityPromptSub: { fontSize: sp(13), color: AppColors.textColor2, marginTop: h(4) },
  cityPromptBtn: {
    paddingHorizontal: w(24),
    paddingVertical: h(10),
    borderRadius: r(24),
    backgroundColor: AppColors.primaryColorTheme,
  },
  cityPromptBtnText: { color: AppColors.white, fontSize: sp(14), fontFamily: quicksand('700') },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: h(12),
  },
  dot: {
    height: h(8),
    borderRadius: h(4),
    marginHorizontal: w(3),
  },
  dotActive: {
    width: w(20),
    backgroundColor: AppColors.primaryColor,
  },
  dotInactive: {
    width: h(8),
    backgroundColor: AppColors.baserColor,
  },
  offerCard: {
    width: w(220),
    padding: w(14),
    borderRadius: r(14),
    backgroundColor: AppColors.primaryColor,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  offerWatermark: {
    position: 'absolute',
    top: h(10),
    right: w(10),
    transform: [{ rotate: '-10deg' }],
  },
  offerDiscountPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: w(10),
    paddingVertical: h(3),
    borderRadius: r(20),
    backgroundColor: AppColors.secondMainColor,
  },
  offerDiscountText: { color: AppColors.white, fontSize: sp(12), fontFamily: quicksand('700') },
  offerTitle: { color: AppColors.white, fontSize: sp(16), fontFamily: quicksand('700') },
  offerDesc: { color: 'rgba(255,255,255,0.9)', fontSize: sp(12), marginTop: h(2) },
  brandTile: {
    width: w(72),
    height: w(72),
    borderRadius: r(16),
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogo: { width: '100%', height: '100%' },
});
