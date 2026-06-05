// Ported from Flutter: lib/screens/vendor/all_vendors_screen.dart (AllVendorsScreen)
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors, w, h } from '@/theme';
import { t } from '@/i18n';
import { AppBar } from '@/components';
import { VendorListCard } from '@/components/cards';
// Feature store (available, though the Flutter screen renders mock data):
import { useVendorStore } from '@/features/vendor/vendorStore';

interface VendorMock {
  name: string;
  cover: string;
  logo: string;
  rating: number;
  reviews: number;
  badges: string[];
}

export default function AllVendorsScreen() {
  const router = useRouter();

  // store available for real data; Flutter screen uses mock data (ported faithfully)
  // const vendors = useVendorStore((s) => s.vendors);
  void useVendorStore;

  // Mock data for vendors
  const _vendors: VendorMock[] = [
    {
      name: 'Sweet Delights',
      cover: 'https://via.placeholder.com/400x200',
      logo: 'https://via.placeholder.com/100',
      rating: 4.8,
      reviews: 320,
      badges: ['Free Delivery', '20% Off'],
    },
    {
      name: 'Sweets Shop',
      cover: 'https://via.placeholder.com/400x200',
      logo: 'https://via.placeholder.com/100',
      rating: 4.8,
      reviews: 320,
      badges: ['Free Delivery', '20% Off'],
    },
    {
      name: 'Golden Bakery',
      cover: 'https://via.placeholder.com/400x200',
      logo: 'https://via.placeholder.com/100',
      rating: 4.5,
      reviews: 150,
      badges: ['Free Delivery'],
    },
  ];

  return (
    <SafeAreaView style={styles.scaffold} edges={['top', 'left', 'right']}>
      {/* AppBar: title "All Vendors", centered, back leading, bottom divider */}
      <AppBar
        title={t('all_vendors')}
        onBack={() => router.back()}
        arrowColor={AppColors.textColorTheme}
      />
      {/* bottom: PreferredSize Divider(height: 1, lightGray @ 0.3) */}
      <View style={styles.divider} />

      <View style={styles.body}>
        <FlatList
          data={_vendors}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: vendor }) => (
            <VendorListCard
              name={vendor.name}
              coverImage={vendor.cover}
              logoImage={vendor.logo}
              rating={vendor.rating}
              reviewCount={vendor.reviews}
              badges={vendor.badges.map((e) => {
                // Translate badges if needed, for now simplistic mapping or raw
                if (e === 'Free Delivery') return t('free_delivery');
                if (e === '20% Off') return `20% ${t('off')}`;
                return e;
              })}
              onPress={() => {
                router.push('/vendor-details');
              }}
            />
          )}
        />
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
    backgroundColor: 'rgba(143, 169, 189, 0.3)', // AppColors.lightGray (#8FA9BD) @ 0.3
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
