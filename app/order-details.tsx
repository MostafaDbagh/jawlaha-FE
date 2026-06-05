// Ported from: lib/screens/home/order_details_screen.dart
import React from 'react';
import {
  View,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText } from '@/components';
// Feature store (read per conventions); this screen renders static data like the Flutter source.
import { useHomeStore } from '@/features/home/homeStore';

// NOTE: Flutter used google_maps_flutter GoogleMap for the address preview.
// Per migration conventions, render a simple map placeholder fallback.
const _initialCameraPosition = {
  target: { latitude: 25.2048, longitude: 55.2708 }, // Dubai
  zoom: 13,
};

function MapPlaceholder() {
  return (
    <View style={styles.mapPlaceholder}>
      <MaterialIcons
        name="location-pin"
        size={sp(28)}
        color={AppColors.primaryColor}
      />
    </View>
  );
}

interface StoreItem {
  name: string;
  qty: string;
  price: string;
}

function StoreItemBlock({
  storeName,
  items,
}: {
  storeName: string;
  items: StoreItem[];
}) {
  return (
    <View style={{ alignItems: 'flex-start' }}>
      {/* Store header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.storeAvatar}>
          <MaterialIcons
            name="store"
            size={sp(14)}
            color={AppColors.primaryColor}
          />
        </View>
        <View style={{ width: w(8) }} />
        <BaseText
          title={storeName}
          size={sp(14)}
          fontWeight="500"
        />
      </View>
      <View style={{ height: h(8) }} />
      <View style={styles.itemsContainer}>
        {items.map((item, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: h(8),
            }}
          >
            <BaseText
              title={`${item.name} x${item.qty}`}
              size={sp(14)}
              color={AppColors.black}
            />
            <BaseText
              title={`${t('aed')} ${item.price}`}
              size={sp(14)}
              fontWeight="bold"
              color={AppColors.black}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function SummaryRow({
  title,
  value,
  isBold = false,
}: {
  title: string;
  value: string;
  isBold?: boolean;
}) {
  return (
    <View
      style={{ flexDirection: 'row', justifyContent: 'space-between' }}
    >
      <BaseText
        title={title}
        size={sp(14)}
        color={isBold ? AppColors.black : AppColors.textColor2}
        fontWeight={isBold ? 'bold' : 'normal'}
      />
      <BaseText
        title={value}
        size={sp(14)}
        color={AppColors.black}
        fontWeight={isBold ? 'bold' : 'normal'}
      />
    </View>
  );
}

export default function OrderDetailsScreen() {
  const router = useRouter();

  // Feature store available per conventions (screen content mirrors the static Flutter source).
  // const order = useHomeStore((s) => s.currentOrder);
  void useHomeStore;
  void _initialCameraPosition;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: AppColors.backgroundColor }}
      edges={['top']}
    >
      {/* AppBar: back arrow, no title, white bg, no elevation */}
      <View style={styles.appBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={sp(24)} color={AppColors.black} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: w(16),
          paddingVertical: h(8),
        }}
      >
        <View style={{ alignItems: 'flex-start' }}>
          {/* Header */}
          <View style={styles.fullRowBetween}>
            <BaseText
              title="#JWL-2025-0098"
              size={sp(16)}
              fontWeight="bold"
              color={AppColors.black}
            />
            <BaseText
              title={t('delivered')}
              size={sp(14)}
              fontWeight="500"
              color={AppColors.primaryColor}
            />
          </View>
          <View style={{ height: h(4) }} />
          <BaseText
            title="Aug 10, 2025 - 7:45 PM"
            size={sp(12)}
            color={AppColors.textColor2}
          />
          <View style={{ height: h(24) }} />

          {/* Stores & Items */}
          <BaseText
            title={t('stores_and_items')}
            size={sp(16)}
            fontWeight="bold"
            color={AppColors.black}
          />
          <View style={{ height: h(16) }} />
          <View style={{ alignSelf: 'stretch' }}>
            <StoreItemBlock
              storeName="Nova Sweets"
              items={[{ name: 'Chocolate Cake', qty: '1', price: '35.00' }]}
            />
          </View>
          <View style={{ height: h(16) }} />
          <View style={{ alignSelf: 'stretch' }}>
            <StoreItemBlock
              storeName="Burger House"
              items={[
                { name: 'Classic Burger', qty: '1', price: '28.00' },
                { name: 'Fries', qty: '1', price: '12.00' },
              ]}
            />
          </View>
          <View style={{ height: h(24) }} />

          {/* Delivery Info */}
          <BaseText
            title={t('delivery_info')}
            size={sp(16)}
            fontWeight="bold"
            color={AppColors.black}
          />
          <View style={{ height: h(12) }} />
          <View style={styles.deliveryInfoCard}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
              style={styles.avatar}
            />
            <View style={{ width: w(12) }} />
            <View style={{ flex: 1 }}>
              <View style={styles.fullRowBetween}>
                <BaseText title="Ahmed M." size={sp(14)} fontWeight="bold" />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <BaseText title="4.9" size={sp(12)} />
                  <MaterialIcons
                    name="star-border"
                    size={sp(14)}
                    color="orange"
                  />
                </View>
              </View>
              <BaseText
                title={`${t('delivered_in')} 32 mins`}
                size={sp(12)}
                color={AppColors.primaryColor}
              />
            </View>
          </View>
          <View style={{ height: h(24) }} />

          {/* Payment Summary */}
          <BaseText
            title={t('payment_summary')}
            size={sp(16)}
            fontWeight="bold"
            color={AppColors.black}
          />
          <View style={{ height: h(12) }} />
          <View style={styles.summaryCard}>
            <SummaryRow title={t('subtotal')} value={`75.00 ${t('aed')}`} />
            <View style={{ height: h(8) }} />
            <SummaryRow
              title={t('delivery_fee')}
              value={`3.50 ${t('aed')}`}
            />
            <View style={styles.divider} />
            <SummaryRow
              title={t('total')}
              value={`78.50 ${t('aed')}`}
              isBold
            />
          </View>
          <View style={{ height: h(24) }} />

          {/* Delivery Address */}
          <BaseText
            title={t('delivery_address_label')}
            size={sp(16)}
            fontWeight="bold"
            color={AppColors.black}
          />
          <View style={{ height: h(12) }} />
          <View style={styles.addressCard}>
            {/* Map Preview */}
            <View style={styles.mapWrap}>
              <MapPlaceholder />
            </View>
            <View style={{ padding: w(12) }}>
              <BaseText
                title="Home - Apartment 502, Building 7, Al Wasl District, Dubai"
                size={sp(12)}
                color={AppColors.black}
              />
            </View>
          </View>
          <View style={{ height: h(32) }} />

          {/* Buttons */}
          <Pressable
            onPress={() => {}}
            style={styles.primaryButton}
          >
            <BaseText
              title={t('order_again')}
              size={sp(16)}
              color={AppColors.white}
              fontWeight="bold"
            />
          </Pressable>
          <View style={{ height: h(16) }} />
          <View style={styles.helpRow}>
            <BaseText
              title={t('order_again')}
              color={AppColors.primaryColor}
              fontWeight="bold"
              size={sp(16)}
            />
            {/* "Order Again" text as per image bottom? Or maybe 'Need Help'?
                Assuming 'Order Again' text as per prompt/image text reading. */}
            <View style={{ width: w(8) }} />
            <MaterialIcons
              name="help-outline"
              color={AppColors.primaryColor}
              size={sp(20)}
            />
          </View>
          <View style={{ height: h(32) }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(8),
    backgroundColor: AppColors.white,
  },
  fullRowBetween: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeAvatar: {
    width: r(24),
    height: r(24),
    borderRadius: r(12),
    backgroundColor: AppColors.baserColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsContainer: {
    alignSelf: 'stretch',
    padding: w(12),
    backgroundColor: AppColors.baserColor,
    borderRadius: r(8),
  },
  deliveryInfoCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    padding: w(12),
    backgroundColor: AppColors.baserColor,
    borderRadius: r(12),
  },
  avatar: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
  },
  summaryCard: {
    alignSelf: 'stretch',
    padding: w(16),
    backgroundColor: AppColors.baserColor,
    borderRadius: r(12),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginVertical: h(12),
  },
  addressCard: {
    alignSelf: 'stretch',
    backgroundColor: AppColors.baserColor,
    borderRadius: r(12),
    overflow: 'hidden',
  },
  mapWrap: {
    height: h(120),
    borderTopLeftRadius: r(12),
    borderTopRightRadius: r(12),
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#D6E0E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    alignSelf: 'stretch',
    height: h(50),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
