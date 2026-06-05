// Ported from screens/cart/widgets/store_card.dart (StoreCard)
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { AppImage, BaseText } from '@/components';

export interface StoreCardProps {
  name: string;
  category: string;
  rating: string;
  imageUrl?: string;
  width?: number;
  onPress?: () => void;
}

export function StoreCard({
  name,
  category,
  rating,
  imageUrl = '',
  width,
  onPress,
}: StoreCardProps) {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.container, { width: width ?? w(160) }]}>
        {/* Image Section */}
        <View style={styles.imageWrapper}>
          {imageUrl.length > 0 ? (
            <AppImage
              source={imageUrl}
              width={undefined as any}
              height={h(100)}
              contentFit="cover"
              style={styles.image}
            />
          ) : (
            <View style={styles.placeholderCenter}>
              <MaterialIcons
                name="store"
                size={sp(40)}
                color={AppColors.hintColor}
              />
            </View>
          )}
        </View>

        {/* Details Section */}
        <View style={styles.details}>
          <BaseText
            title={name}
            numberOfLines={1}
            style={styles.name}
          />
          <View style={{ height: h(4) }} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <BaseText
                title={category}
                numberOfLines={1}
                style={styles.category}
              />
            </View>
            <View style={styles.ratingRow}>
              <BaseText title={rating} style={styles.rating} />
              <View style={{ width: w(2) }} />
              <MaterialIcons
                name="star"
                size={sp(16)}
                color={AppColors.lightOrange}
              />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: w(12),
    backgroundColor: AppColors.white,
    borderRadius: r(16),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    shadowColor: AppColors.black,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  imageWrapper: {
    height: h(100),
    width: '100%',
    backgroundColor: AppColors.baserColor,
    borderTopLeftRadius: r(16),
    borderTopRightRadius: r(16),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: h(100),
  },
  placeholderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    padding: w(10),
  },
  name: {
    fontFamily: quicksand('bold'),
    fontSize: sp(14),
    color: AppColors.textColor,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    color: AppColors.textColor2,
    fontSize: sp(12),
    fontFamily: quicksand('400'),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: sp(12),
    fontFamily: quicksand('600'),
    color: AppColors.textColorTheme,
  },
});

export default StoreCard;
