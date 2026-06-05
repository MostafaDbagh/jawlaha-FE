// Ported from lib/screens/cart/cart_screen.dart (CartScreen)
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { showSnack } from '@/lib/snack';
import { formatPrice } from '@/lib/currency';
import { useCartStore } from '@/features/cart/cartStore';
import {
  CartItemCard,
  OrderSummaryCard,
  PromoCodeInput,
} from '@/components/cards';

export default function CartScreen() {
  const router = useRouter();

  const [promo, setPromo] = useState(''); // final TextEditingController _promoController
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  const items = useCartStore((s) => s.items);
  const summary = useCartStore((s) => s.summary);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    useCartStore.getState().loadCart();
  }, []);

  // No delivery fee data from the backend cart yet -> 0 until known.
  const deliveryFee = 0;
  const total = summary.subtotal + deliveryFee;

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
        {isLoading && items.length === 0 ? (
          <View style={styles.centeredFill}>
            <ActivityIndicator color={AppColors.primaryColor} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centeredFill}>
            <BaseText title={t('empty_cart')} style={styles.emptyText} />
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            <View style={[styles.bodyPadding, { paddingHorizontal: Responsive.getResponsivePadding().paddingHorizontal }]}>
              <View style={{ height: h(16) }} />

              {/* Cart Items */}
              {items.map((item) => (
                <CartItemCard
                  key={`${item.product_id}-${item.variation_id ?? ''}`}
                  name={item.name}
                  description=""
                  price={`${formatPrice(item.unit_price)} × ${item.qty}`}
                  imageUrl={item.image ?? ''}
                  quantity={item.qty}
                  onIncrement={() =>
                    useCartStore
                      .getState()
                      .updateItem(item.product_id, item.qty + 1)
                  }
                  onDecrement={() => {
                    if (item.qty <= 1) {
                      useCartStore.getState().removeItem(item.product_id);
                    } else {
                      useCartStore
                        .getState()
                        .updateItem(item.product_id, item.qty - 1);
                    }
                  }}
                  onDelete={() =>
                    useCartStore.getState().removeItem(item.product_id)
                  }
                />
              ))}

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
                subtotal={formatPrice(summary.subtotal)}
                deliveryFee={formatPrice(deliveryFee)}
                taxes={formatPrice(0)}
                discount={formatPrice(0)}
                total={formatPrice(total)}
              />

              <View style={{ height: h(20) }} />
            </View>
          </ScrollView>
        )}

        {/* Bottom Buttons */}
        <View style={styles.bottomBar}>
          {/* Continue Shopping Button -> back to Home */}
          <Pressable style={styles.outlinedButton} onPress={() => router.push('/(tabs)')}>
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
              // Guests can browse + build a cart, but must sign in to place an order.
              if (!useAuthStore.getState().isLoggedIn) {
                showSnack(t('login_required_to_order'), 'info');
                router.push('/login');
                return;
              }
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
  centeredFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: sp(16),
    color: AppColors.textColor2,
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
