// All shops near you — real branches from the backend.
import React, { useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors, w, h } from '@/theme';
import { t } from '@/i18n';
import { AppBar, BaseText } from '@/components';
import { VendorListCard } from '@/components/cards';
import { cuisineLabels } from '@/lib/cuisines';
import { navArgs } from '@/store/navArgs';
import { useBranchesStore } from '@/features/branches/branchesStore';

export default function AllVendorsScreen() {
  const router = useRouter();

  const branches = useBranchesStore((s) => s.branches);
  const isLoading = useBranchesStore((s) => s.isLoading);

  useEffect(() => {
    useBranchesStore.getState().getBranches();
  }, []);

  return (
    <SafeAreaView style={styles.scaffold} edges={['top', 'left', 'right']}>
      <AppBar
        title={t('all_vendors')}
        onBack={() => router.back()}
        arrowColor={AppColors.textColorTheme}
      />
      <View style={styles.divider} />

      <View style={styles.body}>
        {isLoading && branches.length === 0 ? (
          <ActivityIndicator style={{ marginTop: h(40) }} color={AppColors.primaryColor} />
        ) : (
          <FlatList
            data={branches}
            keyExtractor={(item, index) => String(item.id ?? index)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <BaseText
                title={t('no_orders')}
                style={{ textAlign: 'center', marginTop: h(40), color: AppColors.greyTextColorV3 }}
              />
            }
            renderItem={({ item: branch }) => {
              const badges: string[] = [];
              if (branch.isFeatured) badges.push(t('featured'));
              if (branch.freeDelivery) badges.push(t('free_delivery'));
              if (branch.isOpen) badges.push(t('open_now'));
              return (
                <VendorListCard
                  name={branch.name ?? ''}
                  coverImage={branch.image ?? ''}
                  logoImage={branch.image ?? ''}
                  rating={branch.rating ?? 0}
                  reviewCount={branch.reviewsCount ?? 0}
                  cuisine={cuisineLabels(branch.cuisines)}
                  badges={badges}
                  buttonText={t('view_menu')}
                  onPress={() => {
                    navArgs.set({ branch });
                    router.push('/vendor-details');
                  }}
                />
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scaffold: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(143, 169, 189, 0.3)',
  },
  body: {
    flex: 1,
    paddingHorizontal: w(16),
  },
  listContent: {
    paddingTop: h(16),
    paddingBottom: h(20),
  },
});
