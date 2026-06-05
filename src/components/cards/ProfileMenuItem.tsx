// Ported from: lib/screens/cart/widgets/profile_menu_item.dart
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { BaseText } from '@/components';

export interface ProfileMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
  iconColor?: string;
}

export function ProfileMenuItem(props: ProfileMenuItemProps) {
  const { icon, title, onPress, iconColor } = props;
  const tint = iconColor ?? AppColors.primaryColor;

  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: hexWithOpacity(tint, 0.1) },
          ]}
        >
          <Ionicons name={icon} color={tint} size={sp(22)} />
        </View>
        <View style={{ width: w(16) }} />
        <BaseText title={title} style={styles.title} numberOfLines={1} />
        <Ionicons
          name="chevron-forward"
          size={sp(16)}
          color={AppColors.textColor2}
        />
      </View>
    </Pressable>
  );
}

function hexWithOpacity(hex: string, opacity: number): string {
  const a = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(20),
    paddingVertical: h(16),
    borderBottomWidth: 1,
    borderBottomColor: hexWithOpacity(AppColors.lightGray, 0.2),
  },
  iconBox: {
    width: w(40),
    height: w(40),
    borderRadius: r(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: sp(15),
    fontFamily: quicksand('500'),
    color: AppColors.textColorTheme,
  },
});
