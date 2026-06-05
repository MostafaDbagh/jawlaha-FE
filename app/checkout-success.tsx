// Ported from lib/screens/cart/checkout_success_screen.dart (CheckoutSuccessScreen)
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp, TextStyles } from '@/theme';
import { t } from '@/i18n';
import { BaseText } from '@/components';

export default function CheckoutSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* const Spacer(flex: 2) */}
        <View style={{ flex: 2 }} />

        {/* Check Icon */}
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" color={AppColors.white} size={sp(60)} />
        </View>
        <View style={{ height: h(32) }} />

        {/* Title */}
        <BaseText
          title={t('order_placed')}
          textAlign="center"
          style={[
            TextStyles.bodyLarge,
            { fontSize: sp(22), fontWeight: 'bold', color: AppColors.black },
          ]}
        />
        <View style={{ height: h(16) }} />

        {/* Subtitles */}
        <BaseText
          title={`${t('order_id')}: #JWL-2025-00123`} // Mock ID
          style={{ fontSize: sp(16), color: AppColors.textColor2 }}
        />
        <View style={{ height: h(8) }} />
        <View style={styles.arrivingRow}>
          <MaterialIcons name="access-time" size={sp(18)} color={AppColors.textColor2} />
          <View style={{ width: w(8) }} />
          <BaseText
            title={`${t('arriving_in')} 25-35 mins`}
            style={{ fontSize: sp(16), color: AppColors.textColor2 }}
          />
        </View>

        {/* const Spacer(flex: 3) */}
        <View style={{ flex: 3 }} />

        {/* Buttons */}
        {/* Track Order (Solid) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.trackButton}
          onPress={() => {
            // Get.find<NavigationController>().navigateInTab(Routes.trackingOrder);
            router.push('/tracking-order');
          }}
        >
          <View style={styles.buttonRow}>
            <Ionicons name="location-outline" color={AppColors.white} size={sp(22)} />
            <View style={{ width: w(8) }} />
            <BaseText
              title={t('track_your_order')}
              style={{ fontSize: sp(16), fontWeight: '600', color: AppColors.white }}
            />
          </View>
        </TouchableOpacity>
        <View style={{ height: h(16) }} />

        {/* Back to Home (Outline) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.homeButton}
          onPress={() => {
            // final nav = Get.find<NavigationController>();
            // nav.popToFirstScreen();
            // nav.changeTab(0);
            router.push('/(tabs)');
          }}
        >
          <View style={styles.buttonRow}>
            <Ionicons name="home-outline" color={AppColors.primaryColor} size={sp(22)} />
            <View style={{ width: w(8) }} />
            <BaseText
              title={t('back_to_home')}
              style={{ fontSize: sp(16), fontWeight: '600', color: AppColors.primaryColor }}
            />
          </View>
        </TouchableOpacity>

        {/* const Spacer(flex: 1) */}
        <View style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  container: {
    flex: 1,
    paddingHorizontal: w(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: w(100),
    height: w(100),
    borderRadius: w(100) / 2,
    backgroundColor: AppColors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackButton: {
    width: '100%',
    height: h(54),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    width: '100%',
    height: h(54),
    borderWidth: 1,
    borderColor: AppColors.primaryColor,
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
