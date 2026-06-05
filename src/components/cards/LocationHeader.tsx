// Ported from lib/screens/cart/widgets/location_header.dart (LocationHeader)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, sp } from '@/theme';
import { BaseText } from '@/components';

interface LocationHeaderProps {
  address?: string | null;
}

export function LocationHeader({ address }: LocationHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.column}>
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
            title={address ?? 'Select Location'}
            color={AppColors.mainBlack}
            fontWeight="bold"
            size={sp(14)}
          />
          <MaterialIcons
            name="keyboard-arrow-down"
            color={AppColors.textColor2}
            size={sp(24)}
          />
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <View style={styles.notificationContainer}>
        <MaterialIcons
          name="notifications"
          color={AppColors.textColorTheme}
          size={sp(24)}
        />
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
