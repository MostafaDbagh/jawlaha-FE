// Ported from screens/cart/widgets/category_card.dart (CategoryCard)
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { AppImage, BaseText } from '@/components';

export interface CategoryCardProps {
  label: string;
  /** Ionicons name (Flutter `IconData? icon`) */
  icon?: keyof typeof Ionicons.glyphMap;
  imageUrl?: string;
  onPress?: () => void;
}

export function CategoryCard({ label, icon, imageUrl, onPress }: CategoryCardProps) {
  const fallbackIcon = icon ?? 'grid'; // Icons.category -> closest Ionicons

  const showImage = !!imageUrl && imageUrl.length > 0;

  return (
    <Pressable onPress={onPress}>
      <View style={styles.column}>
        <View style={styles.box}>
          {showImage ? (
            <View style={styles.imagePadding}>
              <AppImage
                source={imageUrl}
                width={65 - 24}
                height={65 - 24}
                contentFit="contain"
                style={styles.image}
              />
            </View>
          ) : (
            <Ionicons name={fallbackIcon} color={AppColors.primaryColor} size={sp(30)} />
          )}
        </View>
        <View style={{ height: h(8) }} />
        <BaseText
          title={label}
          textAlign="center"
          maxLines={1}
          numberOfLines={1}
          fontWeight="500"
          size={sp(12)}
          color={AppColors.textColorTheme}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
  },
  box: {
    width: w(65),
    height: w(65),
    backgroundColor: AppColors.primaryColor + '1A', // withOpacity(0.1) -> light teal background
    borderRadius: r(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePadding: {
    padding: w(12),
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CategoryCard;
