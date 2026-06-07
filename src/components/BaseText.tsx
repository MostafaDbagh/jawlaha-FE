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
  fontWeight,
  maxLines,
  style,
  numberOfLines,
}: BaseTextProps) {
  const base: TextStyle = {
    fontSize: size ?? sp(14),
    // Quicksand bakes the weight into the family name; pick the matching family.
    // Defaults to regular when no weight is given (quicksand(undefined) -> regular).
    fontFamily: quicksand(fontWeight),
    color: color ?? AppColors.textColor,
    textAlign,
    textDecorationLine: decoration,
  };
  // Only clamp (and show the trailing "…") when a caller explicitly asks for a
  // line limit — otherwise text is shown in full and wraps as needed.
  const lineLimit = numberOfLines ?? maxLines;
  // When an explicit fontWeight is passed it must win over any fontFamily that
  // `style` carries (e.g. a TextStyles preset), so the requested weight isn't
  // silently dropped — keeps the Quicksand family consistent across the app.
  const weightFamily =
    fontWeight != null ? { fontFamily: quicksand(fontWeight) } : null;
  return (
    <Text
      numberOfLines={lineLimit}
      ellipsizeMode={lineLimit != null ? 'tail' : undefined}
      style={[base, style, weightFamily]}
    >
      {title ?? ''}
    </Text>
  );
}

export default BaseText;
