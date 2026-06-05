// Ported from screens/cart/widgets/category_card.dart (CategoryCard)
import React, { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { BaseText } from '@/components';

export interface CategoryCardProps {
  label: string;
  /** Ionicons name (Flutter `IconData? icon`) */
  icon?: keyof typeof Ionicons.glyphMap;
  imageUrl?: string;
  onPress?: () => void;
}

export function CategoryCard({ label, icon, imageUrl, onPress }: CategoryCardProps) {
  const fallbackIcon = icon ?? 'grid'; // Icons.category -> closest Ionicons
  const [imgError, setImgError] = useState(false);

  const showImage = !!imageUrl && imageUrl.length > 0 && !imgError;

  return (
    <Pressable onPress={onPress}>
      <View style={styles.column}>
        <View style={styles.box}>
          {showImage ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={0}
              onError={() => setImgError(true)}
            />
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
    overflow: 'hidden',
  },
  image: {
    width: w(65),
    height: w(65),
  },
});

export default CategoryCard;
