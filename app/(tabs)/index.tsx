// Ported from: lib/screens/home/home_screen.dart (HomeScreen)
// This is the HOME tab route file.
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import {
  LocationHeader,
  CustomSearchBar,
  HomeBanner,
  SectionHeader,
  CategoryCard,
  StoreCard,
} from '@/components/cards';
import { navArgs } from '@/store/navArgs';
import { useHomeStore } from '@/features/home/homeStore';

export default function HomeScreen() {
  const router = useRouter();

  // ---- Observed store state (Obx -> useHomeStore selectors) ----
  const addressTitle = useHomeStore((s) => s.addressTitle);
  const banners = useHomeStore((s) => s.banners);
  const isBannersLoading = useHomeStore((s) => s.isBannersLoading);
  const categories = useHomeStore((s) => s.categories);
  const isCategoriesLoading = useHomeStore((s) => s.isCategoriesLoading);
  const popularVendors = useHomeStore((s) => s.popularVendors);
  const isPopularVendorsLoading = useHomeStore((s) => s.isPopularVendorsLoading);
  const nearbyBranches = useHomeStore((s) => s.nearbyBranches);
  const isNearbyBranchesLoading = useHomeStore((s) => s.isNearbyBranchesLoading);

  const [refreshing, setRefreshing] = useState(false);

  // Initial load (Flutter HomeController.onInit / first build)
  useEffect(() => {
    useHomeStore.getState().getHomeData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await useHomeStore.getState().getHomeData();
    setRefreshing(false);
  };

  const responsivePadding = Responsive.getResponsivePadding();

  // --- Shimmer placeholders (shimmer package -> simple grey blocks) ---
  const buildBannerShimmer = () => (
    <View
      style={{
        width: '100%',
        height: h(150),
        backgroundColor: AppColors.lightGreyV2,
        borderRadius: r(12),
      }}
    />
  );

  const buildListShimmer = (height: number, width: number) => (
    <View style={{ height }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[0, 1, 2, 3]}
        keyExtractor={(i) => `shimmer-${i}`}
        ItemSeparatorComponent={() => <View style={{ width: w(16) }} />}
        renderItem={() => (
          <View
            style={{
              width,
              height,
              backgroundColor: AppColors.lightGreyV2,
              borderRadius: r(12),
            }}
          />
        )}
      />
    </View>
  );

  // --- Page indicator dots ---
  const indicatorDot = (isActive: boolean, key: string) => (
    <View
      key={key}
      style={{
        marginHorizontal: w(4),
        width: isActive ? w(24) : w(8),
        height: h(8),
        backgroundColor: isActive ? AppColors.primaryColor : AppColors.baserColor,
        borderRadius: r(4),
      }}
    />
  );

  const buildPageIndicator = () => {
    // If only one banner, hide indicator.
    if (banners.length <= 1) return null;
    return (
      <View style={styles.indicatorRow}>
        {indicatorDot(true, 'dot-0')}
        {indicatorDot(false, 'dot-1')}
        {indicatorDot(false, 'dot-2')}
      </View>
    );
  };

  // --- Categories horizontal list ---
  const buildCategoriesList = () => (
    <View style={{ height: h(90) }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item, index) => `cat-${item.id ?? index}`}
        ItemSeparatorComponent={() => <View style={{ width: w(16) }} />}
        renderItem={({ item: cat }) => (
          <CategoryCard
            imageUrl={cat.imageUrl}
            icon="grid" // Icons.category -> fallback
            label={cat.name ?? ''}
            onPress={() => {
              // Pass category ID to subcategories
              navArgs.set({ categoryId: cat.id, categoryName: cat.name });
              router.push('/sub-categories');
            }}
          />
        )}
      />
    </View>
  );

  // --- Most Popular (horizontal store list) ---
  const buildHorizontalStoreList = () => (
    <View style={{ height: h(200) }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={popularVendors}
        keyExtractor={(item, index) => `vendor-${item.id ?? index}`}
        renderItem={({ item: vendor }) => (
          <StoreCard
            name={vendor.name ?? 'Store'}
            category="General"
            rating="4.5"
            imageUrl={vendor.logoUrl ?? ''}
            onPress={() => {
              navArgs.set({ vendor });
              router.push('/vendor-details');
            }}
          />
        )}
      />
    </View>
  );

  // --- Near You (horizontal store list with wider cards) ---
  const buildHorizontalStoreListVerticalLook = () => (
    <View style={{ height: h(200) }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={nearbyBranches}
        keyExtractor={(item, index) => `branch-${item.id ?? index}`}
        renderItem={({ item: branch }) => (
          <StoreCard
            width={w(280)}
            name={branch.name ?? 'Branch'}
            category="Nearby"
            rating="4.5"
            imageUrl=""
            onPress={() => {
              navArgs.set({ branch });
              router.push('/vendor-details');
            }}
          />
        )}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: responsivePadding.paddingHorizontal,
        }}
      >
        <View style={{ alignItems: 'flex-start' }}>
          <View style={{ height: h(10) }} />

          {/* --- Location Header --- */}
          <LocationHeader address={addressTitle} />
          <View style={{ height: h(16) }} />

          {/* --- Search Bar --- */}
          <View style={styles.fullWidth}>
            <CustomSearchBar
              readOnly
              onPress={() => {
                // navigateInTab(Routes.categories)
                router.push('/(tabs)/categories');
              }}
            />
          </View>
          <View style={{ height: h(20) }} />

          {/* --- Flash Sale Banner --- */}
          {isBannersLoading ? (
            <View style={styles.fullWidth}>{buildBannerShimmer()}</View>
          ) : banners.length > 0 ? (
            <>
              <View style={styles.fullWidth}>
                <HomeBanner
                  title={banners[0].title ?? t('special_offer')}
                  subtitle={banners[0].description ?? t('check_it_out')}
                  footer={`${banners[0].discountValue ?? 0}% ${t('discount')}`}
                  onPress={() => {
                    // navigateInTab(Routes.allVendors)
                    router.push('/all-vendors');
                  }}
                />
              </View>
              <View style={{ height: h(10) }} />
              {buildPageIndicator()}
              <View style={{ height: h(20) }} />
            </>
          ) : null}

          {/* --- Categories --- */}
          {isCategoriesLoading ? (
            buildListShimmer(h(90), w(70))
          ) : categories.length > 0 ? (
            <>
              <View style={styles.headerRow}>
                <BaseText
                  title={t('categories')}
                  style={[
                    TextStyles.headlineMedium,
                    {
                      fontSize: sp(18),
                      fontWeight: 'bold',
                      color: AppColors.textColorTheme,
                    },
                  ]}
                />
                <View
                  style={styles.viewAllRow}
                  onTouchEnd={() => {
                    // nav.changeTab(1) -> switch to categories tab
                    router.push('/(tabs)/categories');
                  }}
                >
                  <BaseText
                    title={t('view_all')}
                    style={[
                      TextStyles.bodySmall,
                      { color: AppColors.greyTextColorV3, fontWeight: '400' },
                    ]}
                  />
                  <View style={{ width: w(4) }} />
                  <MaterialIcons
                    name="arrow-forward"
                    size={sp(16)}
                    color={AppColors.greyTextColorV3}
                  />
                </View>
              </View>
              <View style={{ height: h(12) }} />
              {buildCategoriesList()}
              <View style={{ height: h(20) }} />
            </>
          ) : null}

          {/* --- Most Popular --- */}
          {isPopularVendorsLoading ? (
            <>
              <View style={{ height: h(10) }} />
              {buildListShimmer(h(200), w(150))}
              <View style={{ height: h(10) }} />
            </>
          ) : popularVendors.length > 0 ? (
            <>
              <View style={styles.fullWidth}>
                <SectionHeader
                  title={t('most_popular')}
                  onViewAllTap={() => {
                    // navigateInTab(Routes.allVendors)
                    router.push('/all-vendors');
                  }}
                />
              </View>
              {buildHorizontalStoreList()}
              <View style={{ height: h(10) }} />
            </>
          ) : null}

          {/* --- Near You --- */}
          {isNearbyBranchesLoading ? (
            buildListShimmer(h(200), w(280))
          ) : nearbyBranches.length > 0 ? (
            <>
              <View style={styles.fullWidth}>
                <SectionHeader
                  title={t('near_you')}
                  onViewAllTap={() => {
                    // navigateInTab(Routes.allVendors)
                    router.push('/all-vendors');
                  }}
                />
              </View>
              {buildHorizontalStoreListVerticalLook()}
              <View style={{ height: h(10) }} />
            </>
          ) : null}

          {/* --- Restaurant (Example of filtering if needed) --- */}
          {/* Keeping commented or removing if redundancy with categories */}
          {/* <SectionHeader title="Restaurant" /> */}
          {/* {buildHorizontalStoreListVerticalLook()} */}
          <View style={{ height: h(20) }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  fullWidth: {
    width: '100%',
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
