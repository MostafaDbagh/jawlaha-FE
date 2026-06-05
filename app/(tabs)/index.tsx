// Home tab — Keeta-style: Categories -> Offers for you -> Popular brands -> Restaurants.
// The search bar type-filters the categories / brands / restaurant lists.
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import {
  LocationHeader,
  CustomSearchBar,
  SectionHeader,
  CategoryCard,
  RestaurantRowCard,
} from '@/components/cards';
import type { RestaurantBadge } from '@/components/cards/RestaurantRowCard';
import { navArgs } from '@/store/navArgs';
import { useHomeStore } from '@/features/home/homeStore';
import type { BranchModel } from '@/types/branch';

export default function HomeScreen() {
  const router = useRouter();

  const addressTitle = useHomeStore((s) => s.addressTitle);
  const banners = useHomeStore((s) => s.banners);
  const categories = useHomeStore((s) => s.categories);
  const isCategoriesLoading = useHomeStore((s) => s.isCategoriesLoading);
  const popularVendors = useHomeStore((s) => s.popularVendors);
  const nearbyBranches = useHomeStore((s) => s.nearbyBranches);
  const isNearbyBranchesLoading = useHomeStore((s) => s.isNearbyBranchesLoading);

  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

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
  const filteredBrands = useMemo(
    () =>
      !q
        ? popularVendors
        : popularVendors.filter((v) =>
            [v.name, v.description].some((f) => (f ?? '').toLowerCase().includes(q)),
          ),
    [popularVendors, q],
  );
  const filteredBranches = useMemo(
    () =>
      !q
        ? nearbyBranches
        : nearbyBranches.filter((b) =>
            [b.name, b.vendorName, b.city].some((f) => (f ?? '').toLowerCase().includes(q)),
          ),
    [nearbyBranches, q],
  );

  useEffect(() => {
    useHomeStore.getState().getHomeData();
  }, []);

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
    if (branch.freeDelivery) badges.push({ text: t('free_delivery'), type: 'free' });
    return badges;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingHorizontal: responsivePadding.paddingHorizontal,
          paddingBottom: h(24),
        }}
      >
        <View style={{ height: h(10) }} />
        <LocationHeader address={addressTitle} />
        <View style={{ height: h(16) }} />
        <View style={styles.fullWidth}>
          <CustomSearchBar value={query} onChangeText={setQuery} />
        </View>

        {/* 1. Categories */}
        {(isCategoriesLoading || filteredCategories.length > 0) && (
          <>
            <View style={{ height: h(20) }} />
            <SectionHeader
              title={t('categories')}
              onViewAllTap={() => router.push('/(tabs)/categories')}
            />
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
                renderItem={({ item: o }) => (
                  <Pressable onPress={() => router.push('/all-vendors')} style={styles.offerCard}>
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

        {/* 4. Restaurants */}
        {(isNearbyBranchesLoading || filteredBranches.length > 0) && (
          <>
            <View style={{ height: h(20) }} />
            <SectionHeader title={t('restaurants')} onViewAllTap={() => router.push('/all-vendors')} />
            <View style={{ height: h(12) }} />
            {filteredBranches.map((branch, i) => (
              <RestaurantRowCard
                key={`rest-${branch.id ?? i}`}
                name={branch.name ?? ''}
                image={branch.image}
                cuisine={branch.city ?? ''}
                deliveryTime={branch.deliveryTime}
                distanceKm={branch.distanceKm}
                freeDelivery={branch.freeDelivery}
                badges={badgesFor(branch)}
                onPress={() => openBranch(branch)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.white },
  fullWidth: { width: '100%' },
  offerCard: {
    width: w(220),
    padding: w(14),
    borderRadius: r(14),
    backgroundColor: AppColors.primaryColor,
    justifyContent: 'center',
  },
  offerDiscountPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: w(10),
    paddingVertical: h(3),
    borderRadius: r(20),
    backgroundColor: AppColors.secondMainColor,
  },
  offerDiscountText: { color: AppColors.white, fontSize: sp(12), fontWeight: '700' },
  offerTitle: { color: AppColors.white, fontSize: sp(16), fontWeight: '700' },
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
