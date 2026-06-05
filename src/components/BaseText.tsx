// Ported from core/widgets/text/base_text.dart (BaseText)
import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { AppColors, sp } from '@/theme';
import { quicksand } from '@/theme/typography';

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
  maxLines,
  style,
  numberOfLines,
}: BaseTextProps) {
  const base: TextStyle = {
    fontSize: size ?? sp(14),
    // Quicksand bakes the weight into the family name; pick the matching family.
    fontFamily: quicksand(fontWeight),
    color: color ?? AppColors.textColor,
    textAlign,
    textDecorationLine: decoration,
  };
  // Only clamp (and show the trailing "…") when a caller explicitly asks for a
  // line limit — otherwise text is shown in full and wraps as needed.
  const lineLimit = numberOfLines ?? maxLines;
  return (
    <Text
      numberOfLines={lineLimit}
      ellipsizeMode={lineLimit != null ? 'tail' : undefined}
      style={[base, style]}
    >
      {title ?? ''}
    </Text>
  );
}

export default BaseText;
