// Cart line item card. Layout: rounded thumbnail · name / option / price · a
// pill quantity stepper (− n +) with a trash button on the right.
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { AppImage, BaseText } from '@/components';

export interface CartItemCardProps {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  quantity: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onDelete?: () => void;
}

export function CartItemCard(props: CartItemCardProps) {
  const {
    name,
    description,
    price,
    imageUrl,
    quantity,
    onIncrement,
    onDecrement,
    onDelete,
  } = props;

  return (
    <View style={styles.container}>
      {/* Product image */}
      <View style={styles.imageBox}>
        {imageUrl.length > 0 ? (
          <AppImage
            source={imageUrl}
            width={w(64)}
            height={w(64)}
            borderRadius={r(16)}
            contentFit="cover"
          />
        ) : (
          <MaterialIcons name="shopping-bag" color={AppColors.textColor2} size={sp(28)} />
        )}
      </View>
      <View style={{ width: w(12) }} />

      {/* Name · option · price */}
      <View style={styles.details}>
        <BaseText title={name} numberOfLines={1} style={styles.name} />
        {description.length > 0 && (
          <>
            <View style={{ height: h(4) }} />
            <BaseText title={description} numberOfLines={1} style={styles.description} />
          </>
        )}
        <View style={{ height: h(8) }} />
        <BaseText title={price} numberOfLines={1} style={styles.price} />
      </View>

      <View style={{ width: w(8) }} />

      {/* Quantity stepper pill + delete */}
      <View style={styles.controls}>
        <View style={styles.stepperPill}>
          <Pressable onPress={onDecrement} hitSlop={6} style={styles.stepBtn}>
            <MaterialIcons name="remove" size={sp(18)} color={AppColors.textColor2} />
          </Pressable>
          <BaseText title={quantity.toString()} style={styles.quantity} />
          <Pressable onPress={onIncrement} hitSlop={6} style={styles.stepBtn}>
            <MaterialIcons name="add" size={sp(18)} color={AppColors.primaryColor} />
          </Pressable>
        </View>
        <View style={{ width: w(8) }} />
        <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" color={AppColors.textColor2} size={sp(22)} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h(12),
    padding: w(12),
    backgroundColor: AppColors.white,
    borderRadius: r(16),
    shadowColor: AppColors.black,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageBox: {
    width: w(64),
    height: w(64),
    backgroundColor: AppColors.lightGreyV2,
    borderRadius: r(16),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  details: {
    flex: 1,
    alignItems: 'flex-start',
  },
  name: {
    fontFamily: quicksand('bold'),
    fontSize: sp(15),
    color: AppColors.textColorTheme,
  },
  description: {
    fontFamily: quicksand('400'),
    color: AppColors.textColor2,
    fontSize: sp(13),
  },
  price: {
    fontFamily: quicksand('bold'),
    fontSize: sp(14),
    color: AppColors.textColorTheme,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.lightGreyV2,
    borderRadius: r(24),
    paddingHorizontal: w(4),
    height: h(36),
  },
  stepBtn: {
    width: w(30),
    height: h(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    minWidth: w(22),
    textAlign: 'center',
    fontFamily: quicksand('bold'),
    fontSize: sp(15),
    color: AppColors.textColorTheme,
  },
  deleteBtn: {
    width: w(32),
    height: w(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CartItemCard;
