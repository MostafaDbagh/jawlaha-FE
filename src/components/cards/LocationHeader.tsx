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
  // When provided (guest users), shows a person icon that opens the login page.
  onPressLogin?: () => void;
}

export function LocationHeader({
  address,
  onPressLocation,
  onPressNotifications,
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
      {isGuest ? (
        // Guest: hide notifications, show a sign-in icon that opens login.
        <Pressable
          style={styles.notificationContainer}
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
          style={styles.notificationContainer}
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
  notificationContainer: {
    padding: w(8),
    backgroundColor: AppColors.lightGreyV2,
    borderRadius: 9999,
  },
});
