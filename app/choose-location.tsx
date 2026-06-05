// Ported from screens/cart/choose_location_screen.dart (ChooseLocationScreen)
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { useI18n } from '@/i18n';
import { BaseText } from '@/components';
import { navArgs } from '@/store/navArgs';
import { useBranchesStore } from '@/features/branches/branchesStore';

interface AddressItem {
  type: 'home' | 'work' | 'other';
  icon: { lib: 'material'; name: keyof typeof MaterialIcons.glyphMap };
  address: string;
}

export default function ChooseLocationScreen() {
  const router = useRouter();
  const { isRTL } = useI18n();

  // Imported per migration spec; the Flutter screen uses static address data.
  // const branches = useBranchesStore((s) => s.branches);
  void useBranchesStore;

  const [selectedIndex, setSelectedIndex] = useState(0); // Default to first address (Home)

  const addresses: AddressItem[] = [
    {
      type: 'home', // Key for translation
      icon: { lib: 'material', name: 'home' }, // Icons.home_outlined
      address: '123 Main Street, Apartment 4B, Dubai, DXB 10001',
    },
    {
      type: 'work',
      icon: { lib: 'material', name: 'work-outline' }, // Icons.work_outline
      address: 'Floor 8, Building 4, Business Bay, Dubai, UAE',
    },
    {
      type: 'other',
      icon: { lib: 'material', name: 'location-on' }, // Icons.location_on_outlined
      address: 'Shop 12, City Mall, Sheikh Zayed Road, Dubai, UAE',
    },
  ];

  const backIcon = isRTL ? 'arrow-forward' : 'arrow-back';

  const renderSelectionIndicator = (isSelected: boolean) => {
    if (isSelected) {
      return (
        <View style={styles.indicatorSelected}>
          <Ionicons name="checkmark" color={AppColors.white} size={sp(14)} />
        </View>
      );
    }
    return <View style={styles.indicatorUnselected} />;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.appBarLeading}
        >
          <Ionicons
            name={backIcon as any}
            color={AppColors.textColorTheme}
            size={r(24)}
          />
        </Pressable>
        <View style={styles.appBarTitleWrap}>
          <BaseText
            title={t('choose_location_title')}
            size={sp(18)}
            fontWeight="bold"
            color={AppColors.textColorTheme}
          />
        </View>
        <View style={styles.appBarLeading} />
      </View>
      <View style={styles.appBarDivider} />

      {/* body */}
      <ScrollView
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.alignLeft}>
          <BaseText
            title={t('saved_addresses')}
            size={sp(14)}
            color={AppColors.textColor2}
          />
        </View>
        <View style={{ height: h(16) }} />

        {addresses.map((address, index) => {
          const isSelected = selectedIndex === index;
          let typeKey: string;
          if (address.type === 'home') typeKey = 'home';
          else if (address.type === 'work') typeKey = 'work';
          else typeKey = 'other';

          return (
            <View key={index}>
              {index > 0 ? <View style={{ height: h(16) }} /> : null}
              <Pressable
                onPress={() => setSelectedIndex(index)}
                style={[
                  styles.card,
                  {
                    borderColor: isSelected
                      ? AppColors.primaryColorTheme
                      : AppColors.lightGreyV2,
                    borderWidth: isSelected ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.row}>
                  <MaterialIcons
                    name={address.icon.name}
                    color={AppColors.textColorTheme}
                    size={sp(24)}
                  />
                  <View style={{ width: w(12) }} />
                  <View style={styles.flex1}>
                    <BaseText
                      title={t(typeKey)}
                      size={sp(16)}
                      fontWeight="bold"
                      color={AppColors.textColorTheme}
                    />
                    <View style={{ height: h(4) }} />
                    <BaseText
                      title={address.address}
                      size={sp(14)}
                      color={AppColors.textColor2}
                      style={{ lineHeight: sp(14) * 1.3 }}
                    />
                  </View>
                  <View style={{ width: w(8) }} />
                  <Pressable
                    onPress={() => {
                      navArgs.set({ isEdit: true });
                      router.push('/add-address');
                    }}
                    hitSlop={8}
                  >
                    <Feather
                      name="edit-2"
                      color={AppColors.primaryColorTheme}
                      size={sp(18)}
                    />
                  </Pressable>
                  <View style={{ width: w(12) }} />
                  {renderSelectionIndicator(isSelected)}
                </View>
              </Pressable>
            </View>
          );
        })}

        {/* Add New Address Button */}
        <Pressable
          onPress={() => {
            navArgs.set({ isEdit: false });
            router.push('/add-address');
          }}
          style={styles.addButton}
        >
          <Ionicons
            name="add"
            color={AppColors.primaryColorTheme}
            size={sp(20)}
          />
          <View style={{ width: w(4) }} />
          <BaseText
            title={t('add_new_address')}
            size={sp(16)}
            fontWeight="600"
            color={AppColors.primaryColorTheme}
          />
        </Pressable>
        <View style={{ height: h(20) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    paddingHorizontal: w(8),
  },
  appBarLeading: {
    width: w(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  appBarDivider: {
    height: 1,
    backgroundColor: AppColors.lightGray + '4D', // withOpacity(0.3)
  },
  bodyContent: {
    padding: w(16),
    flexGrow: 1,
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  card: {
    padding: w(16),
    backgroundColor: AppColors.white,
    borderRadius: r(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flex1: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: h(12),
  },
  indicatorSelected: {
    padding: w(4),
    backgroundColor: AppColors.primaryColorTheme,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorUnselected: {
    width: w(24),
    height: w(24),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
  },
});
