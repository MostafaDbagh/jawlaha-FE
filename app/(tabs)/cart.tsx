// Ported from lib/screens/cart/cart_screen.dart (CartScreen)
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import {
  CartItemCard,
  OrderSummaryCard,
  PromoCodeInput,
} from '@/components/cards';

export default function CartScreen() {
  const router = useRouter();

  const [promo, setPromo] = useState(''); // final TextEditingController _promoController
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable
          style={styles.leading}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={sp(24)}
            color={AppColors.textColorTheme}
          />
        </Pressable>
        <BaseText title={t('my_cart')} style={styles.appBarTitle} />
        <View style={styles.leading} />
      </View>

      {/* body: Column */}
      <View style={{ flex: 1 }}>
        {/* Expanded -> SingleChildScrollView */}
        <ScrollView style={{ flex: 1 }}>
          <View style={[styles.bodyPadding, { paddingHorizontal: Responsive.getResponsivePadding().paddingHorizontal }]}>
            <View style={{ height: h(16) }} />

            {/* Cart Items */}
            <CartItemCard
              name="Organic Avocado"
              description="Extra ripe"
              price="22 ₿ × 1"
              imageUrl=""
              quantity={1}
              onIncrement={() => {}}
              onDecrement={() => {}}
              onDelete={() => {}}
            />
            <CartItemCard
              name="Strawberry"
              description="Premium qu..."
              price="AED 18 × 2 ₿ × 1"
              imageUrl=""
              quantity={2}
              onIncrement={() => {}}
              onDecrement={() => {}}
              onDelete={() => {}}
            />
            <CartItemCard
              name="Saffron"
              description="100% pure 1..."
              price="AED 45 × 1 ₿ × 1"
              imageUrl=""
              quantity={1}
              onIncrement={() => {}}
              onDecrement={() => {}}
              onDelete={() => {}}
            />

            <View style={{ height: h(16) }} />

            {/* Promo Code Section */}
            <PromoCodeInput
              value={promo}
              onChangeText={setPromo}
              onApply={() => {
                setIsPromoApplied(true);
              }}
              isApplied={isPromoApplied}
              appliedMessage={t('promo_code_applied')}
            />

            <View style={{ height: h(20) }} />

            {/* Order Summary */}
            <OrderSummaryCard
              subtotal="AED 103.00"
              deliveryFee="AED 10.00"
              taxes="AED 5.15"
              discount="-AED 8.50"
              total="AED 109.65"
            />

            <View style={{ height: h(20) }} />
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.bottomBar}>
          {/* Continue Shopping Button */}
          <Pressable style={styles.outlinedButton} onPress={() => {}}>
            <BaseText
              title={t('continue_shopping')}
              style={styles.outlinedButtonText}
            />
          </Pressable>
          <View style={{ height: h(12) }} />

          {/* Proceed to Checkout Button */}
          <Pressable
            style={styles.elevatedButton}
            onPress={() => {
              // Get.find<NavigationController>().navigateInTab(Routes.checkoutAddress);
              router.push('/checkout-address');
            }}
          >
            <BaseText
              title={t('proceed_to_checkout')}
              style={styles.elevatedButtonText}
            />
          </Pressable>
        </View>
      </View>
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
    height: h(56),
    backgroundColor: AppColors.white,
    paddingHorizontal: w(4),
  },
  leading: {
    width: w(48),
    height: w(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    color: AppColors.textColorTheme,
    fontSize: sp(18),
    fontWeight: 'bold',
  },
  bodyPadding: {
    alignItems: 'flex-start',
  },
  bottomBar: {
    padding: w(16),
    backgroundColor: AppColors.white,
    shadowColor: AppColors.black,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  outlinedButton: {
    width: '100%',
    height: h(50),
    borderWidth: 1.5,
    borderColor: AppColors.primaryColor,
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedButtonText: {
    color: AppColors.primaryColor,
    fontSize: sp(16),
    fontWeight: 'bold',
  },
  elevatedButton: {
    width: '100%',
    height: h(50),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  elevatedButtonText: {
    color: AppColors.white,
    fontSize: sp(16),
    fontWeight: 'bold',
  },
});
