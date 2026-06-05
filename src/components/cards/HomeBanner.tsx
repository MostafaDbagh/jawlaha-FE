// Ported from: lib/screens/cart/widgets/home_banner.dart
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BaseText } from '@/components';
import { AppColors, h, r, sp, w } from '@/theme';

export interface HomeBannerProps {
  title?: string;
  subtitle?: string;
  footer?: string;
  onPress?: () => void;
}

export function HomeBanner(props: HomeBannerProps) {
  const {
    title = 'FLASH SALE',
    subtitle = 'Up to 50% off!',
    footer = 'Limited time offer',
    onPress,
  } = props;

  return (
    <View style={styles.container}>
      {/* Background decorative circles (Stack) */}
      <View style={styles.circleLarge} />
      <View style={styles.circleSmall} />

      <View style={styles.content}>
        {/* Title badge */}
        <View style={styles.badge}>
          <BaseText title={title} style={styles.badgeText} />
        </View>
        <View style={{ height: h(10) }} />

        {/* Subtitle */}
        <View style={{ width: w(200) }}>
          <BaseText title={subtitle} style={styles.subtitle} />
        </View>
        <View style={{ height: h(4) }} />

        {/* Footer */}
        <BaseText title={footer} style={styles.footer} />
        <View style={{ height: h(12) }} />

        {/* Shop Now button */}
        <Pressable style={styles.button} onPress={onPress ?? (() => {})}>
          <BaseText title="Shop Now" style={styles.buttonText} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: h(160),
    backgroundColor: AppColors.primaryColor, // Dark Teal background
    borderRadius: r(16),
    overflow: 'hidden',
  },
  circleLarge: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: w(150),
    height: w(150),
    backgroundColor: AppColors.teal, // Lighter teal/green
    borderRadius: w(150) / 2,
  },
  circleSmall: {
    position: 'absolute',
    right: 0,
    bottom: -10,
    width: w(120),
    height: w(120),
    backgroundColor: AppColors.teal, // Lighter teal/green
    borderRadius: w(120) / 2,
  },
  content: {
    padding: w(20),
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: w(8),
    paddingVertical: h(4),
    backgroundColor: AppColors.secondMainColor, // Orange/Red for Flash Sale
    borderRadius: r(4),
  },
  badgeText: {
    color: AppColors.white,
    fontSize: sp(10),
    fontWeight: 'bold',
  },
  subtitle: {
    color: AppColors.white,
    fontSize: sp(18),
    fontWeight: 'bold',
  },
  footer: {
    color: 'rgba(255, 255, 255, 0.7)', // AppColors.white.withOpacity(0.7)
    fontSize: sp(12),
  },
  button: {
    backgroundColor: AppColors.lightCyan, // Use a light color for button
    minWidth: w(100),
    height: h(35),
    paddingHorizontal: w(16),
    borderRadius: r(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: AppColors.primaryColor, // Text color
    fontWeight: 'bold',
    fontSize: sp(12),
  },
});
