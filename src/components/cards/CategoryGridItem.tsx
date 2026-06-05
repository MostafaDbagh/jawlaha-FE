// Ported from lib/widgets/category_grid_item.dart (CategoryGridItem)
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { BaseText } from '@/components';

interface CategoryGridItemProps {
  title: string;
  optionsCount: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}

export function CategoryGridItem({
  title,
  optionsCount,
  icon,
  onPress,
}: CategoryGridItemProps) {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} color="#235A5E" size={sp(28)} />
        </View>
        <View style={{ height: h(12) }} />
        <BaseText
          title={title}
          size={sp(14)}
          fontWeight="bold"
          color={AppColors.textColorTheme}
          textAlign="center"
        />
        <View style={{ height: h(4) }} />
        <BaseText
          title={optionsCount}
          size={sp(12)}
          color={AppColors.textColor2}
          textAlign="center"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: r(16),
    borderWidth: 1,
    borderColor: AppColors.lightTeal + '80', // withOpacity(0.5)
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    padding: w(16),
    backgroundColor: AppColors.lightTeal + '33', // withOpacity(0.2)
    borderRadius: 9999,
  },
});

export default CategoryGridItem;
