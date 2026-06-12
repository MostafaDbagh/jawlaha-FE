// The user's favorites — hearted restaurants and meals, loaded from the
// backend. Tapping a row opens its details; tapping the heart removes it.
import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { goBack } from '@/lib/nav';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { AppImage, BaseText } from '@/components';
import { navArgs } from '@/store/navArgs';
import { useFavoritesStore, type FavoriteEntry } from '@/features/favorites/favoritesStore';
import { formatPrice } from '@/lib/currency';
import { parseBranchModel } from '@/types/branch';
import { parseProductModel } from '@/types/product';

export default function FavoritesScreen() {
  const router = useRouter();
  const entries = useFavoritesStore((s) => s.entries);
  const isLoading = useFavoritesStore((s) => s.isLoading);

  // Reload on focus so hearts toggled on other screens are reflected here.
  useFocusEffect(
    useCallback(() => {
      useFavoritesStore.getState().load();
    }, []),
  );

  const branches = entries.filter((e) => e.item_type === 'branch');
  const products = entries.filter((e) => e.item_type === 'product');

  const openEntry = (entry: FavoriteEntry) => {
    if (entry.item_type === 'branch') {
      navArgs.set({ branch: parseBranchModel(entry.item) });
      router.push('/vendor-details');
    } else {
      navArgs.set({ product: parseProductModel(entry.item) });
      router.push('/product-details');
    }
  };

  const buildRow = (entry: FavoriteEntry) => {
    const item = entry.item ?? {};
    const subtitle =
      entry.item_type === 'product'
        ? formatPrice(Number(item.final_price ?? item.price) || 0)
        : item.address ?? '';
    return (
      <Pressable
        key={`${entry.item_type}:${entry.item_id}`}
        style={styles.row}
        onPress={() => openEntry(entry)}
      >
        {item.image ? (
          <AppImage
            source={item.image}
            width={w(56)}
            height={w(56)}
            borderRadius={r(12)}
            contentFit="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons
              name={entry.item_type === 'branch' ? 'storefront' : 'fastfood'}
              size={sp(24)}
              color={AppColors.primaryColor}
            />
          </View>
        )}
        <View style={styles.rowBody}>
          <BaseText
            title={item.name ?? ''}
            size={sp(15)}
            fontWeight="600"
            color={AppColors.textColorTheme}
            numberOfLines={1}
          />
          {!!subtitle && (
            <BaseText
              title={String(subtitle)}
              size={sp(12)}
              color={AppColors.textColor2}
              numberOfLines={1}
              style={{ marginTop: h(2) }}
            />
          )}
        </View>
        <Pressable
          hitSlop={10}
          onPress={() => useFavoritesStore.getState().toggle(entry.item_type, entry.item_id)}
        >
          <Ionicons name="heart" size={sp(22)} color={AppColors.red} />
        </Pressable>
      </Pressable>
    );
  };

  const buildSection = (title: string, rows: FavoriteEntry[]) =>
    rows.length > 0 ? (
      <View style={{ marginBottom: h(16) }}>
        <BaseText
          title={title}
          size={sp(16)}
          fontWeight="bold"
          color={AppColors.textColorTheme}
          style={{ marginBottom: h(10) }}
        />
        {rows.map(buildRow)}
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable style={styles.leading} onPress={() => goBack(router)}>
          <MaterialIcons name="arrow-back" size={sp(24)} color={AppColors.textColorTheme} />
        </Pressable>
        <BaseText
          title={t('favorites')}
          size={sp(18)}
          fontWeight="bold"
          color={AppColors.textColorTheme}
        />
        <View style={styles.leading} />
      </View>

      {isLoading && entries.length === 0 ? (
        <View style={styles.centeredFill}>
          <ActivityIndicator color={AppColors.primaryColor} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centeredFill}>
          <Ionicons name="heart-outline" size={sp(48)} color={AppColors.lightGreyV2} />
          <BaseText
            title={t('no_favorites')}
            size={sp(14)}
            color={AppColors.textColor2}
            style={{ marginTop: h(12), textAlign: 'center', paddingHorizontal: w(32) }}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: w(16) }}>
          {buildSection(t('restaurants'), branches)}
          {buildSection(t('meals'), products)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(16),
    paddingVertical: h(12),
  },
  leading: {
    width: w(32),
    alignItems: 'flex-start',
  },
  centeredFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: r(14),
    padding: w(10),
    marginBottom: h(10),
  },
  rowBody: {
    flex: 1,
    marginHorizontal: w(12),
  },
  imagePlaceholder: {
    width: w(56),
    height: w(56),
    borderRadius: r(12),
    backgroundColor: AppColors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
