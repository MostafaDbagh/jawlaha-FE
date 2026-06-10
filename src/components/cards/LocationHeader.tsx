// Ported from lib/screens/cart/widgets/location_header.dart (LocationHeader)
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText } from '@/components';

interface LocationHeaderProps {
  address?: string | null;
  onPressLocation?: () => void;
  onPressNotifications?: () => void;
  // Opens the cart. The basket shows a badge with the current item count.
  onPressCart?: () => void;
  cartCount?: number;
  // When provided (guest users), shows a person icon that opens the login page.
  onPressLogin?: () => void;
}

export function LocationHeader({
  address,
  onPressLocation,
  onPressNotifications,
  onPressCart,
  cartCount = 0,
  onPressLogin,
}: LocationHeaderProps) {
  // No saved location -> prompt the user to set one (no static default city).
  const hasLocation = !!address && address.trim().length > 0;
  // Guests (onPressLogin provided) get a sign-in icon; location is disabled.
  const isGuest = !!onPressLogin;
  const locationDisabled = !onPressLocation;
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.column, locationDisabled && styles.disabled]}
        onPress={onPressLocation}
        disabled={locationDisabled}
      >
        <BaseText
          title="Location"
          color={AppColors.textColor2}
          size={sp(12)}
        />
        <View style={{ height: h(4) }} />
        <View style={styles.locationRow}>
          <MaterialIcons
            name="location-on"
            color={AppColors.primaryColor}
            size={sp(20)}
          />
          <View style={{ width: w(4) }} />
          <BaseText
            title={hasLocation ? (address as string) : t('enter_your_location')}
            color={hasLocation ? AppColors.mainBlack : AppColors.textColor2}
            fontWeight="bold"
            size={sp(14)}
          />
          <MaterialIcons
            name="keyboard-arrow-down"
            color={AppColors.textColor2}
            size={sp(24)}
          />
        </View>
      </Pressable>
      <View style={{ flex: 1 }} />
      <View style={styles.actions}>
        {/* Cart / basket — opens the cart; badge shows the current item count. */}
        {onPressCart && (
          <Pressable style={styles.iconButton} onPress={onPressCart} hitSlop={8}>
            <MaterialIcons
              name="shopping-cart"
              color={AppColors.textColorTheme}
              size={sp(24)}
            />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <BaseText
                  title={cartCount > 99 ? '99+' : String(cartCount)}
                  color={AppColors.white}
                  fontWeight="bold"
                  size={sp(10)}
                />
              </View>
            )}
          </Pressable>
        )}
        {isGuest ? (
          // Guest: hide notifications, show a sign-in icon that opens login.
          <Pressable
            style={styles.iconButton}
            onPress={onPressLogin}
            hitSlop={8}
          >
            <MaterialIcons
              name="person-outline"
              color={AppColors.textColorTheme}
              size={sp(24)}
            />
          </Pressable>
        ) : (
          <Pressable
            style={styles.iconButton}
            onPress={onPressNotifications}
            disabled={!onPressNotifications}
            hitSlop={8}
          >
            <MaterialIcons
              name="notifications"
              color={AppColors.textColorTheme}
              size={sp(24)}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    alignItems: 'flex-start',
  },
  disabled: {
    opacity: 0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: w(8),
  },
  iconButton: {
    padding: w(8),
    backgroundColor: AppColors.lightGreyV2,
    borderRadius: 9999,
  },
  // Item-count bubble on the cart icon.
  badge: {
    position: 'absolute',
    top: -h(2),
    right: -w(2),
    minWidth: w(18),
    height: w(18),
    paddingHorizontal: w(4),
    borderRadius: 9999,
    backgroundColor: AppColors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.white,
  },
});
