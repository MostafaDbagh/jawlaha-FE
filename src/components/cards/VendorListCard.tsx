// Ported from lib/widgets/vendor_list_card.dart (VendorListCard)
import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { BaseText } from '@/components';
import { t } from '@/i18n';

export interface VendorListCardProps {
  name: string;
  coverImage: string;
  logoImage: string;
  rating: number;
  reviewCount: number;
  badges?: string[];
  onPress?: () => void;
  buttonText?: string;
}

export function VendorListCard({
  name,
  coverImage,
  logoImage,
  rating,
  reviewCount,
  badges = [],
  onPress,
  buttonText,
}: VendorListCardProps) {
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <View style={styles.card}>
      {/* Cover Image and Logo */}
      <View style={styles.coverWrapper}>
        {/* Cover Image */}
        <View style={styles.coverClip}>
          {coverError ? (
            <View style={styles.coverFallback}>
              <MaterialIcons name="image" color={AppColors.hintColor} size={sp(50)} />
            </View>
          ) : (
            <Image
              source={{ uri: coverImage }}
              style={styles.coverImage}
              contentFit="cover"
              transition={0}
              onError={() => setCoverError(true)}
            />
          )}
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          {logoError ? (
            <MaterialIcons name="store" color={AppColors.primaryColor} size={sp(30)} />
          ) : (
            <Image
              source={{ uri: logoImage }}
              style={styles.logoImage}
              contentFit="cover"
              transition={0}
              onError={() => setLogoError(true)}
            />
          )}
        </View>
      </View>

      <View style={styles.body}>
        {/* Name and Rating */}
        <View style={styles.nameRow}>
          <BaseText
            title={name}
            numberOfLines={1}
            style={styles.nameText}
            // eslint-disable-next-line react-native/no-inline-styles
          />
          <View style={styles.ratingRow}>
            <BaseText title={rating.toString()} style={styles.ratingValue} />
            <View style={{ width: w(4) }} />
            <BaseText title={`(${reviewCount}+)`} style={styles.reviewCount} />
          </View>
        </View>
        <View style={{ height: h(12) }} />

        {/* Badges */}
        {badges.length > 0 && (
          <View style={styles.badgesWrap}>
            {badges.map((badge, index) => (
              <View key={`${badge}-${index}`} style={styles.badge}>
                <BaseText title={badge} style={styles.badgeText} />
              </View>
            ))}
          </View>
        )}

        <View style={{ height: h(16) }} />

        {/* View Store Button */}
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <BaseText
            title={buttonText ?? t('view_store')}
            style={styles.buttonText}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: h(16),
    backgroundColor: AppColors.white,
    borderRadius: r(16),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    shadowColor: AppColors.black,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  coverWrapper: {
    height: h(180),
    // Stack with clipBehavior: Clip.none — logo overflows the cover
  },
  coverClip: {
    borderTopLeftRadius: r(16),
    borderTopRightRadius: r(16),
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: h(150),
  },
  coverFallback: {
    width: '100%',
    height: h(150),
    backgroundColor: AppColors.baserColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    bottom: 0,
    left: w(16),
    width: w(60),
    height: w(60),
    borderRadius: w(60) / 2,
    backgroundColor: AppColors.white,
    borderWidth: 3,
    borderColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: AppColors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    padding: w(16),
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    flex: 1,
    fontSize: sp(18),
    fontFamily: quicksand('bold'),
    color: AppColors.textColorTheme,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: sp(14),
    fontFamily: quicksand('bold'),
    color: AppColors.textColorTheme,
  },
  reviewCount: {
    fontSize: sp(12),
    color: AppColors.textColor2,
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: w(8),
  },
  badge: {
    paddingHorizontal: w(12),
    paddingVertical: h(6),
    backgroundColor: 'rgba(72, 208, 176, 0.2)', // AppColors.lightTeal @ 0.2 opacity
    borderRadius: r(20),
  },
  badgeText: {
    fontSize: sp(12),
    color: AppColors.darkTeal,
    fontFamily: quicksand('500'),
  },
  button: {
    width: '100%',
    height: h(45),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: sp(16),
    fontFamily: quicksand('600'),
    color: AppColors.white,
  },
});

export default VendorListCard;
