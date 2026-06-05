// Ported from lib/screens/categories/categories_screen.dart (CategoriesScreen)
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, w, h, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import { CategoryGridItem } from '@/components/cards';
// Feature store (ProductController -> useProductStore). The Flutter screen renders
// mock data, so the store is imported here to mirror the Flutter feature wiring.
import { useProductStore } from '@/features/categories/productStore';

type CategoryItem = {
  title: string;
  count: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

export default function CategoriesScreen() {
  const router = useRouter();

  // The store is available for this tab (mirrors Flutter ProductController binding).
  // Mock data is rendered exactly like the Flutter source below.
  useProductStore;

  // Mock Data matching the image
  const categories: CategoryItem[] = [
    { title: 'Restaurants', count: '120+ options', icon: 'restaurant' }, // Icons.restaurant_menu
    { title: 'Groceries', count: '85+ options', icon: 'cart' }, // Icons.shopping_cart
    { title: 'Sweets', count: '60+ options', icon: 'ice-cream' }, // Icons.cake
    { title: 'Water', count: '60+ options', icon: 'water' }, // Icons.water_drop
    { title: 'Pharmacy', count: '75+ options', icon: 'medkit' }, // Icons.local_pharmacy
    { title: 'Electronics', count: '75+ options', icon: 'phone-portrait' }, // Icons.phone_android
    { title: 'Gas', count: '90+ options', icon: 'flame' }, // Icons.local_gas_station
    { title: 'Donations', count: '10+ options', icon: 'heart' }, // Icons.favorite
  ];

  return (
    <SafeAreaView style={styles.scaffold} edges={['top']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        {/* leading: IconButton(Icons.arrow_back) */}
        {/* If this screen is pushed, allow back. If it's a tab, back might need handling or hiding. */}
        {/* For now, assuming typical navigation structure where we can go back if pushed. */}
        {/* onPressed: Get.find<NavigationController>().handleBackPress() */}
        <Ionicons
          name="arrow-back"
          size={sp(24)}
          color={AppColors.textColorTheme}
          onPress={() => router.back()}
          style={styles.leading}
        />
        <View style={styles.titleWrap}>
          <BaseText
            title={t('categories_title')}
            size={sp(18)}
            fontWeight="bold"
            color={AppColors.textColorTheme}
            textAlign="center"
          />
        </View>
        {/* spacer to balance the leading icon and keep title centered */}
        <View style={styles.leading} />
      </View>
      {/* bottom: Divider(height 1, lightGray withOpacity(0.3)) */}
      <View style={styles.divider} />

      {/* body */}
      <View style={styles.body}>
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={(_, index) => String(index)}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <CategoryGridItem
                title={item.title}
                optionsCount={item.count}
                icon={item.icon}
                onPress={() => {
                  // Navigate to SubCategories screen when a category is tapped
                  // Get.find<NavigationController>().navigateInTab(Routes.subCategories)
                  router.push('/sub-categories');
                }}
              />
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scaffold: {
    flex: 1,
    backgroundColor: AppColors.white, // Scaffold backgroundColor: AppColors.white
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: AppColors.white, // AppBar backgroundColor: AppColors.white, elevation 0
  },
  leading: { padding: 4, width: 32 },
  titleWrap: { flex: 1, alignItems: 'center' },
  divider: {
    height: 1,
    backgroundColor: AppColors.lightGray + '4D', // lightGray.withOpacity(0.3)
  },
  body: {
    flex: 1,
    padding: w(16), // EdgeInsets.all(16.w)
  },
  // GridView crossAxisCount: 2, crossAxisSpacing: 16.w, mainAxisSpacing: 16.h, childAspectRatio: 0.85
  row: {
    marginBottom: h(16), // mainAxisSpacing
  },
  cell: {
    flex: 1,
    aspectRatio: 0.85, // childAspectRatio
    marginHorizontal: w(8), // half of crossAxisSpacing 16 on each side
  },
});
