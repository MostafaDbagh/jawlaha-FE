// Ported from: lib/screens/categories/product_details_screen.dart
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
// Feature store (mirrors Get.find<ProductController>()). The Flutter screen uses
// only mock data, but the store is wired up here for parity with the feature.
import { useProductStore } from '@/features/categories/productStore';

interface ProductOption {
  name: string;
  price: number;
  selected: boolean;
}

export default function ProductDetailsScreen() {
  const router = useRouter();

  // Store reference (kept for parity with the Flutter controller usage).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentProduct = useProductStore((s) => s.currentProduct);

  // Mock data
  const _productName = 'Cheese cake';
  const _basePrice = 28.0;
  const _description =
    'Sweet Haven offers delicious homemade pastries, cakes, and beverages made with the finest ingredients. Perfect for every occasion.';

  // Customization selections
  const [options, setOptions] = useState<ProductOption[]>([
    { name: 'Extra cream', price: 20.0, selected: false },
    { name: 'Extra cream', price: 20.0, selected: false }, // Duplicate for visual matching
    { name: 'Extra Chees', price: 2.0, selected: true },
  ]);

  const toggleOption = (index: number) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, selected: !o.selected } : o)),
    );
  };

  const buildIndicator = (isActive: boolean, key: number) => (
    <View
      key={key}
      style={[
        styles.indicator,
        {
          backgroundColor: isActive
            ? AppColors.white
            : `${AppColors.white}80`,
        },
      ]}
    />
  );

  const buildOptionTile = (option: ProductOption, index: number) => {
    const isSelected = option.selected;
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.8}
        onPress={() => toggleOption(index)}
      >
        <View
          style={[
            styles.optionTile,
            {
              backgroundColor: isSelected
                ? `${AppColors.lightTeal}4D` // 0.3 opacity
                : AppColors.white,
              borderColor: isSelected
                ? AppColors.primaryColor
                : AppColors.lightGreyV2,
              borderWidth: isSelected ? 1.5 : 1.0,
            },
          ]}
        >
          <BaseOptionText
            text={option.name}
            color={isSelected ? AppColors.primaryColor : AppColors.textColorTheme}
            weight="500"
          />
          <BaseOptionText
            text={`+ ${option.price} ${t('aed')}`}
            color={isSelected ? AppColors.primaryColor : AppColors.textColor2}
            weight="600"
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 0 }}
        >
          {/* Header Image (SliverAppBar expandedHeight 300.h) */}
          <View style={styles.headerImageWrap}>
            <Image
              source={{ uri: 'https://via.placeholder.com/400x300' }}
              style={styles.headerImage}
              contentFit="cover"
            />

            {/* Leading back button */}
            <View style={styles.leadingBtn}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" color={AppColors.white} size={sp(20)} />
              </TouchableOpacity>
            </View>

            {/* Action favorite button */}
            <View style={styles.actionBtn}>
              <TouchableOpacity onPress={() => {}}>
                <Ionicons
                  name="heart-outline"
                  color={AppColors.white}
                  size={sp(20)}
                />
              </TouchableOpacity>
            </View>

            {/* Carousel indicators mock */}
            <View style={styles.indicatorsRow}>
              {buildIndicator(true, 0)}
              <View style={{ width: w(4) }} />
              {buildIndicator(false, 1)}
              <View style={{ width: w(4) }} />
              {buildIndicator(false, 2)}
            </View>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Name and Price */}
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <BaseTextRaw
                  text={_productName}
                  style={{
                    fontSize: sp(24),
                    fontWeight: 'bold',
                    color: AppColors.textColorTheme,
                  }}
                />
              </View>
              <BaseTextRaw
                text={`${t('aed')} ${_basePrice.toFixed(0)}`}
                style={{
                  fontSize: sp(18),
                  fontWeight: 'bold',
                  color: AppColors.errorColor, // Reddish color for price
                }}
              />
            </View>
            <View style={{ height: h(16) }} />

            {/* Description */}
            <BaseTextRaw
              text={_description}
              style={{
                fontSize: sp(14),
                color: AppColors.textColor2,
                lineHeight: sp(14) * 1.5,
              }}
            />
            <View style={{ height: h(24) }} />

            <View style={styles.divider} />
            <View style={{ height: h(24) }} />

            {/* Options */}
            {options.map((option, index) => buildOptionTile(option, index))}

            <View style={{ height: h(32) }} />

            {/* Add to Cart Button (inline) */}
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {}}
                style={styles.addToCartBtn}
              >
                <BaseTextRaw
                  text={t('add_to_cart')}
                  style={{
                    color: AppColors.white,
                    fontSize: sp(16),
                    fontWeight: '600',
                  }}
                />
              </TouchableOpacity>
            </View>

            <View style={{ height: h(100) }} /> {/* Space for bottom bar */}
          </View>
        </ScrollView>

        {/* Bottom View Cart Bar */}
        <View style={styles.bottomBar}>
          <BaseTextRaw
            text={`2 ${t('items')} • 85 ${t('aed')}`}
            style={{
              color: AppColors.white,
              fontSize: sp(16),
              fontWeight: '600',
            }}
          />
          <BaseTextRaw
            text={t('view_cart')}
            style={{
              color: AppColors.white,
              fontSize: sp(16),
              fontWeight: 'bold',
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// Small inline text helper (keeps style array semantics close to Flutter Text).
function BaseTextRaw({ text, style }: { text: string; style?: TextStyle }) {
  return <Text style={style}>{text}</Text>;
}

function BaseOptionText({
  text,
  color,
  weight,
}: {
  text: string;
  color: string;
  weight: TextStyle['fontWeight'];
}) {
  return (
    <Text style={{ fontSize: sp(15), fontWeight: weight, color }}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  root: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  headerImageWrap: {
    height: h(300),
    width: '100%',
  },
  headerImage: {
    height: h(300),
    width: '100%',
  },
  leadingBtn: {
    position: 'absolute',
    top: h(8),
    left: w(8),
    margin: w(8),
    backgroundColor: `${AppColors.black}80`, // 0.5 opacity
    borderRadius: 999,
    width: w(36),
    height: w(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    position: 'absolute',
    top: h(8),
    right: w(8),
    margin: w(8),
    backgroundColor: `${AppColors.black}80`, // 0.5 opacity
    borderRadius: 999,
    width: w(36),
    height: w(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorsRow: {
    position: 'absolute',
    bottom: h(16),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: w(8),
    height: w(8),
    borderRadius: 999,
  },
  body: {
    padding: w(16),
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: `${AppColors.lightGray}80`, // 0.5 opacity
  },
  optionTile: {
    marginBottom: h(12),
    paddingHorizontal: w(16),
    paddingVertical: h(16),
    borderRadius: r(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addToCartBtn: {
    width: w(150),
    height: h(48),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: h(20),
    left: w(16),
    right: w(16),
    paddingHorizontal: w(16),
    paddingVertical: h(12),
    backgroundColor: AppColors.darkTeal, // Dark Teal
    borderRadius: r(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: AppColors.black,
    shadowOpacity: 0.26,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
