// Ported from lib/screens/categories/sub_categories_screen.dart (SubCategoriesScreen)
// Reached from the home Categories row with navArgs { categoryId, categoryName }.
// Products live under branches, so we browse a LIST OF SHOPS (real branches).
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { goBack } from '@/lib/nav';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { QuicksandFamily, quicksand } from '@/theme/typography';
import { BaseText } from '@/components';
import { VendorListCard } from '@/components/cards';
import { t } from '@/i18n';
import { navArgs, useNavArgs } from '@/store/navArgs';
import { useBranchesStore } from '@/features/branches/branchesStore';

export default function SubCategoriesScreen() {
  const router = useRouter();
  const args = useNavArgs((s) => s.args);
  const categoryName = args.categoryName as string | undefined;

  const branches = useBranchesStore((s) => s.branches);
  const isLoading = useBranchesStore((s) => s.isLoading);

  useEffect(() => {
    useBranchesStore.getState().getBranches();
  }, []);

  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const _showFilterBottomSheet = () => setFilterSheetVisible(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable
          onPress={() => goBack(router)}
          hitSlop={8}
          style={styles.appBarLeading}
        >
          <Ionicons name="arrow-back" size={r(24)} color={AppColors.textColorTheme} />
        </Pressable>
        <BaseText
          title={categoryName ?? t('sub_categories_title')}
          style={styles.appBarTitle}
        />
        <View style={styles.appBarLeading} />
      </View>
      {/* AppBar bottom divider (PreferredSize 1.0) */}
      <View style={styles.appBarDivider} />

      {/* Body (Stack) */}
      <View style={styles.stack}>
        <View style={styles.column}>
          <View style={{ height: h(16) }} />

          {/* Search Bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchField}>
              <Ionicons name="search" size={sp(22)} color={AppColors.hintColor} />
              <TextInput
                placeholder="Search"
                placeholderTextColor={AppColors.hintColor}
                style={styles.searchInput}
              />
              <Ionicons
                name="camera-outline"
                size={sp(22)}
                color={AppColors.hintColor}
              />
            </View>
          </View>

          <View style={{ height: h(16) }} />

          {/* Shop List (real branches) */}
          <View style={{ flex: 1 }}>
            {isLoading && branches.length === 0 ? (
              <ActivityIndicator
                style={{ marginTop: h(40) }}
                color={AppColors.primaryColor}
              />
            ) : (
              <FlatList
                data={branches}
                keyExtractor={(item, index) => String(item.id ?? index)}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <BaseText
                    title={t('no_orders')}
                    style={styles.emptyText}
                  />
                }
                renderItem={({ item: branch }) => {
                  const badges: string[] = [];
                  if (branch.freeDelivery) badges.push(t('free_delivery'));
                  if (branch.isOpen) badges.push(t('open_now'));
                  return (
                    <VendorListCard
                      name={branch.name ?? ''}
                      coverImage={branch.image ?? ''}
                      logoImage={branch.image ?? ''}
                      rating={branch.rating ?? 0}
                      reviewCount={branch.reviewsCount ?? 0}
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
        </View>

        {/* Floating Sort | Filter Button */}
        <View style={styles.floatingWrap} pointerEvents="box-none">
          <Pressable onPress={_showFilterBottomSheet}>
            <View style={styles.floatingButton}>
              <BaseText title={t('sort')} style={styles.floatingText} />
              <View style={{ width: w(4) }} />
              <MaterialIcons name="swap-vert" size={sp(16)} color={AppColors.white} />
              <View style={{ width: w(12) }} />
              <View style={styles.floatingDivider} />
              <View style={{ width: w(12) }} />
              <BaseText title={t('filter')} style={styles.floatingText} />
              <View style={{ width: w(4) }} />
              <MaterialIcons
                name="filter-alt"
                size={sp(16)}
                color={AppColors.white}
              />
            </View>
          </Pressable>
        </View>
      </View>

      <FilterBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

function FilterBottomSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [openNow, setOpenNow] = useState(true);
  const [offers, setOffers] = useState(false);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [highlyRated, setHighlyRated] = useState(true);
  const [newPlaces, setNewPlaces] = useState(false);
  const [sortBy] = useState<string>(t('recommended'));

  const _buildCheckboxTile = (
    title: string,
    value: boolean,
    onChanged: (val: boolean) => void,
  ) => (
    <Pressable style={styles.checkboxTile} onPress={() => onChanged(!value)}>
      <View
        style={[
          styles.checkbox,
          { backgroundColor: value ? AppColors.primaryColor : AppColors.white },
        ]}
      >
        {value && (
          <MaterialIcons name="check" size={sp(16)} color={AppColors.white} />
        )}
      </View>
      <View style={{ width: w(12) }} />
      <BaseText title={title} style={styles.checkboxTitle} />
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.sheetContent}>
          {/* Drag handle */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
          <View style={{ height: h(24) }} />

          <BaseText title={t('special_features')} style={styles.sheetHeading} />
          <View style={{ height: h(16) }} />

          {_buildCheckboxTile(t('open_now'), openNow, setOpenNow)}
          {_buildCheckboxTile(t('offers_discounts'), offers, setOffers)}
          {_buildCheckboxTile(t('free_delivery'), freeDelivery, setFreeDelivery)}
          {_buildCheckboxTile(t('highly_rated'), highlyRated, setHighlyRated)}
          {_buildCheckboxTile(t('new_places'), newPlaces, setNewPlaces)}

          <View style={{ height: h(24) }} />
          <BaseText title={t('sort_by')} style={styles.sheetHeading} />
          <View style={{ height: h(16) }} />

          {/* DropdownButton (single option: recommended) */}
          <View style={styles.dropdown}>
            <BaseText title={sortBy} style={styles.dropdownText} />
            <MaterialIcons
              name="arrow-drop-down"
              size={sp(24)}
              color={AppColors.textColorTheme}
            />
          </View>
          <View style={{ height: h(40) }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  // AppBar
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: AppColors.white,
  },
  appBarLeading: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: sp(18),
    fontFamily: quicksand('bold'),
    color: AppColors.textColorTheme,
  },
  appBarDivider: {
    height: 1,
    backgroundColor: 'rgba(143, 169, 189, 0.3)', // AppColors.lightGray @ 0.3
  },
  // Body
  stack: {
    flex: 1,
    position: 'relative',
  },
  column: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(16),
  },
  searchField: {
    flex: 1,
    height: h(48),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.lightGreyV2,
    borderRadius: r(8),
    paddingHorizontal: w(12),
  },
  searchInput: {
    flex: 1,
    paddingVertical: h(12),
    paddingHorizontal: w(8),
    color: AppColors.textColorTheme,
    fontSize: sp(14),
    fontFamily: QuicksandFamily.regular,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: h(40),
    color: AppColors.greyTextColorV3,
  },
  listPadding: {
    paddingHorizontal: w(16),
  },
  // Floating button
  floatingWrap: {
    position: 'absolute',
    bottom: h(30),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(24),
    paddingVertical: h(12),
    backgroundColor: AppColors.darkTeal,
    borderRadius: r(30),
    shadowColor: AppColors.black,
    shadowOpacity: 0.26,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  floatingText: {
    color: AppColors.white,
    fontSize: sp(14),
    fontFamily: quicksand('600'),
  },
  floatingDivider: {
    height: h(16),
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // white @ 0.5
  },
  // Bottom sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: r(20),
    borderTopRightRadius: r(20),
    maxHeight: '90%',
  },
  sheetContent: {
    padding: w(24),
  },
  handleWrap: {
    alignItems: 'center',
  },
  handle: {
    width: w(40),
    height: h(4),
    backgroundColor: AppColors.baserColor,
    borderRadius: r(2),
  },
  sheetHeading: {
    fontSize: sp(18),
    fontFamily: quicksand('bold'),
    color: AppColors.textColorTheme,
  },
  checkboxTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: h(4),
  },
  checkbox: {
    width: w(24),
    height: w(24),
    borderRadius: r(4),
    borderWidth: 2,
    borderColor: AppColors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTitle: {
    fontSize: sp(16),
    color: AppColors.textColorTheme,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(16),
    paddingVertical: h(4),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(8),
  },
  dropdownText: {
    fontSize: sp(14),
    color: AppColors.textColorTheme,
  },
});
