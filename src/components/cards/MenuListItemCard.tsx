// Ported from lib/widgets/menu_list_item_card.dart (MenuListItemCard)
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { AppImage, BaseText } from '@/components';

export interface MenuListItemCardProps {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  onAdd?: () => void;
  onPress?: () => void;
}

export function MenuListItemCard({
  name,
  description,
  price,
  imageUrl,
  onAdd,
  onPress,
}: MenuListItemCardProps) {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.row}>
          {imageUrl ? (
            <AppImage
              source={imageUrl}
              width={w(80)}
              height={w(80)}
              contentFit="cover"
              borderRadius={r(8)}
              style={styles.image}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="image" color={AppColors.grey} size={sp(20)} />
            </View>
          )}
          <View style={{ width: w(12) }} />
          <View style={styles.content}>
            <BaseText
              title={name}
              size={sp(16)}
              fontWeight="bold"
              color={AppColors.textColorTheme}
            />
            <View style={{ height: h(4) }} />
            <BaseText
              title={description}
              size={sp(12)}
              color={AppColors.textColor2}
              numberOfLines={2}
            />
            <View style={{ height: h(8) }} />
            <View style={styles.priceRow}>
              <BaseText
                title={price}
                size={sp(16)}
                fontWeight="bold"
                color={AppColors.textColorTheme}
              />
              <Pressable onPress={onAdd} style={styles.addButton}>
                <MaterialIcons name="add" color="#FFFFFF" size={sp(20)} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: h(16),
    padding: w(12),
    backgroundColor: '#FFFFFF',
    borderRadius: r(12),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    height: w(80),
    width: w(80),
    borderRadius: r(8),
  },
  imagePlaceholder: {
    height: w(80),
    width: w(80),
    borderRadius: r(8),
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    padding: w(6),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(8),
  },
});

export default MenuListItemCard;
