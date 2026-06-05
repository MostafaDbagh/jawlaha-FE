// Ported from core/widgets/text/base_text.dart (BaseText)
import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { AppColors, sp } from '@/theme';

interface BaseTextProps {
  title?: string | null;
  size?: number;
  color?: string;
  textAlign?: TextStyle['textAlign'];
  decoration?: 'underline' | 'line-through' | 'none';
  fontWeight?: TextStyle['fontWeight'];
  maxLines?: number;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export function BaseText({
  title,
  size,
  color,
  textAlign,
  decoration,
  fontWeight = '400',
  maxLines = 100,
  style,
  numberOfLines,
}: BaseTextProps) {
  const base: TextStyle = {
    fontSize: size ?? sp(14),
    fontWeight,
    color: color ?? AppColors.textColor,
    textAlign,
    textDecorationLine: decoration,
  };
  return (
    <Text
      numberOfLines={numberOfLines ?? maxLines}
      ellipsizeMode="tail"
      style={[base, style]}
    >
      {title ?? ''}
    </Text>
  );
}

export default BaseText;
