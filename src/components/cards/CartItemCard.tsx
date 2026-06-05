// Ported from screens/cart/widgets/cart_item_card.dart (CartItemCard)
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
      {/* Product Image */}
      <View style={styles.imageBox}>
        {imageUrl.length > 0 ? (
          <AppImage
            source={imageUrl}
            width={w(70)}
            height={w(70)}
            borderRadius={r(12)}
            contentFit="cover"
          />
        ) : (
          <MaterialIcons
            name="shopping-bag"
            color="#BDBDBD"
            size={sp(30)}
          />
        )}
      </View>
      <View style={{ width: w(12) }} />

      {/* Product Details */}
      <View style={styles.details}>
        <BaseText
          title={name}
          numberOfLines={1}
          style={styles.name}
        />
        <View style={{ height: h(4) }} />
        <BaseText
          title={description}
          numberOfLines={1}
          style={styles.description}
        />
        <View style={{ height: h(6) }} />
        <BaseText title={price} style={styles.price} />
      </View>

      {/* Quantity Controls */}
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Decrement Button */}
          <Pressable onPress={onDecrement} style={styles.decrementBtn}>
            <MaterialIcons
              name="remove"
              size={sp(16)}
              color={AppColors.textColorTheme}
            />
          </Pressable>
          <View style={{ width: w(12) }} />

          {/* Quantity */}
          <BaseText title={quantity.toString()} style={styles.quantity} />
          <View style={{ width: w(12) }} />

          {/* Increment Button */}
          <Pressable onPress={onIncrement} style={styles.incrementBtn}>
            <MaterialIcons
              name="add"
              size={sp(16)}
              color={AppColors.primaryColor}
            />
          </Pressable>
        </View>
        <View style={{ height: h(8) }} />

        {/* Delete Button */}
        <Pressable onPress={onDelete}>
          <MaterialIcons
            name="delete-outline"
            color={AppColors.textColor2}
            size={sp(20)}
          />
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
    width: w(70),
    height: w(70),
    backgroundColor: AppColors.baserColor,
    borderRadius: r(12),
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
    fontSize: sp(14),
  },
  description: {
    color: AppColors.textColor2,
    fontSize: sp(12),
  },
  price: {
    fontFamily: quicksand('bold'),
    fontSize: sp(14),
    color: AppColors.textColorTheme,
  },
  decrementBtn: {
    width: w(28),
    height: w(28),
    backgroundColor: AppColors.lightGreyV2,
    borderRadius: r(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementBtn: {
    width: w(28),
    height: w(28),
    backgroundColor: 'rgba(35,90,94,0.1)',
    borderRadius: r(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: sp(14),
    fontFamily: quicksand('bold'),
  },
});

export default CartItemCard;
