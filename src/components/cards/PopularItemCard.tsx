// Ported from lib/widgets/popular_item_card.dart (PopularItemCard)
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { AppImage, BaseText } from '@/components';

interface PopularItemCardProps {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  onAdd?: () => void;
}

export function PopularItemCard({
  name,
  description,
  price,
  imageUrl,
  onAdd,
}: PopularItemCardProps) {
  return (
    <View style={styles.container}>
      {/* ClipRRect top rounded image */}
      <View style={styles.imageClip}>
        <AppImage
          source={imageUrl}
          height={h(100)}
          contentFit="cover"
          style={styles.image}
        />
      </View>
      <View style={styles.padding}>
        <BaseText title={name} style={styles.name} numberOfLines={1} />
        <View style={{ height: h(4) }} />
        <BaseText
          title={description}
          style={styles.description}
          numberOfLines={2}
        />
        <View style={{ height: h(8) }} />
        <View style={styles.priceRow}>
          <BaseText title={price} style={styles.price} />
          <Pressable onPress={onAdd}>
            <View style={styles.addButton}>
              <MaterialIcons name="add" color={AppColors.white} size={sp(16)} />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: w(160),
    marginRight: w(12),
    backgroundColor: AppColors.white,
    borderRadius: r(12),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageClip: {
    borderTopLeftRadius: r(12),
    borderTopRightRadius: r(12),
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    height: h(100),
    width: '100%',
  },
  padding: {
    padding: w(10),
    width: '100%',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: sp(14),
    fontFamily: quicksand('bold'),
    color: AppColors.textColorTheme,
  },
  description: {
    fontSize: sp(10),
    color: AppColors.textColor2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  price: {
    fontSize: sp(14),
    fontFamily: quicksand('bold'),
    color: AppColors.textColorTheme,
  },
  addButton: {
    padding: w(4),
    backgroundColor: AppColors.primaryColor,
    borderRadius: 999,
  },
});
