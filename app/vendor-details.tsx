// Ported from Flutter:
//   lib/screens/vendor/vendor_details_screen.dart  (VendorDetailsScreen)
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { AppImage, BaseText } from '@/components';
import {
  PromotionCard,
  PopularItemCard,
  MenuListItemCard,
} from '@/components/cards';

export default function VendorDetailsScreen() {
  const router = useRouter();

  // _menuCategories
  const menuCategories: string[] = [
    t('cakes'),
    t('pastries'),
    t('drinks'),
    t('desserts'),
  ];

  // late TabController _tabController; -> selected tab index state
  const [tabIndex, setTabIndex] = useState(0);

  const buildBadge = (text: string) => (
    <View style={styles.badge}>
      <BaseText
        title={text}
        style={{ fontSize: sp(12), fontWeight: '500' }}
      />
    </View>
  );

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
              source="https://via.placeholder.com/400x200"
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
            <View style={styles.leadingWrap}>
              <Pressable
                style={styles.circleBtn}
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
            <View style={styles.actionsWrap}>
              <Pressable style={styles.circleBtn} onPress={() => {}}>
                <Ionicons
                  name="heart-outline"
                  color={AppColors.black}
                  size={sp(20)}
                />
              </Pressable>
              <View style={{ width: w(8) }} />
              <Pressable
                style={[styles.circleBtn, { marginRight: w(8) }]}
                onPress={() => {}}
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
                  source="https://via.placeholder.com/100"
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
                  title="Sweet Haven"
                  style={{
                    fontSize: sp(20),
                    fontWeight: 'bold',
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
                    title={`10:00 ${t('am')} - 12:00 ${t('am')}`}
                    style={{ fontSize: sp(12), color: AppColors.textColor2 }}
                  />
                  <View style={{ flex: 1 }} />
                  <MaterialIcons
                    name="star"
                    size={sp(16)}
                    color={AppColors.lightOrange}
                  />
                  <BaseText
                    title={` 4.8 (420+ ${t('reviews')})`}
                    style={{
                      fontSize: sp(12),
                      color: AppColors.textColorTheme,
                      fontWeight: '600',
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
                {buildBadge(t('free_delivery'))}
                <View style={{ width: w(8) }} />
                {buildBadge(`20% ${t('off')}`)}
                <View style={{ width: w(8) }} />
                {buildBadge(t('halal'))}
              </View>
            </ScrollView>
            <View style={{ height: h(20) }} />

            {/* About Section */}
            <BaseText
              title={t('about')}
              style={{
                fontSize: sp(16),
                fontWeight: 'bold',
                color: AppColors.textColorTheme,
              }}
            />
            <View style={{ height: h(8) }} />
            <BaseText
              title="Sweet Haven offers delicious homemade pastries, cakes, and beverages made with the finest ingredients. Perfect for every occasion."
              style={{ fontSize: sp(13), color: AppColors.textColor2 }}
            />
            <View style={{ height: h(16) }} />

            {/* Location Card */}
            <View style={styles.locationCard}>
              <View style={styles.minimap}>
                <AppImage
                  source="https://via.placeholder.com/50x50"
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
                  title="Al Wahda Mall, Abu Dhabi"
                  style={{ fontSize: sp(14), fontWeight: '500' }}
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
                fontWeight: 'bold',
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
                  description="On orders above 50 SAR"
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
                      key={e}
                      onPress={() => setTabIndex(index)}
                      style={styles.tab}
                    >
                      <BaseText
                        title={e}
                        style={{
                          fontWeight: selected ? 'bold' : '500',
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
                style={{ fontSize: sp(18), fontWeight: 'bold' }}
              />
              <BaseText
                title={t('view_all')}
                style={{ fontSize: sp(14), color: AppColors.textColor2 }}
              />
            </View>
            <View style={{ height: h(16) }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row' }}>
                {[0, 1, 2].map((index) => (
                  <PopularItemCard
                    key={index}
                    name={
                      index === 0 ? 'Chocolate Strawb..' : 'Truffle Cake'
                    }
                    description="Chocolate & Strawberry mix cheese cake..."
                    price={`32.00 ${t('sar')}`}
                    imageUrl="https://via.placeholder.com/150"
                    onAdd={() => {}}
                  />
                ))}
              </View>
            </ScrollView>
            <View style={{ height: h(24) }} />

            {/* Category Header for List */}
            <BaseText
              title={t('cakes')}
              style={{ fontSize: sp(18), fontWeight: 'bold' }}
            />
            <View style={{ height: h(16) }} />
          </View>

          {/* SliverPadding + SliverList - Vertical List */}
          <View style={{ paddingHorizontal: w(16) }}>
            {[0, 1, 2, 3, 4].map((index) => (
              <MenuListItemCard
                key={index}
                name="Chocolate Truffle Cake"
                description="Chocolate Truffle Cake, Mix with Egg, Chocolate Cubes..."
                price={`${28.0 + index * 5} ${t('sar')}`}
                imageUrl="https://via.placeholder.com/100"
                onAdd={() => {}}
                onPress={() => {
                  router.push('/product-details');
                }}
              />
            ))}
          </View>

          {/* SliverToBoxAdapter - Space for bottom cart */}
          <View style={{ height: h(80) }} />
        </ScrollView>

        {/* Bottom Cart Button (Positioned) */}
        <View style={styles.bottomCartWrap}>
          <View style={styles.bottomCart}>
            <BaseText
              title={`2 ${t('items')} • 85 ${t('sar')}`}
              style={{
                color: AppColors.white,
                fontSize: sp(16),
                fontWeight: '600',
              }}
            />
            <BaseText
              title={t('view_cart')}
              style={{
                color: AppColors.white,
                fontSize: sp(16),
                fontWeight: 'bold',
              }}
            />
          </View>
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
  },
  actionsWrap: {
    position: 'absolute',
    top: h(8),
    right: w(8),
    flexDirection: 'row',
    alignItems: 'center',
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
});
