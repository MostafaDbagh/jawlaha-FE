import { TextStyle } from 'react-native';
import { AppColors } from './colors';
import { sp } from './scale';

// Font families. The Flutter app uses Google Fonts SFPro (en) / Almarai (ar) / Inter.
// Until custom fonts are bundled we fall back to the platform system font.
export const Fonts = {
  sfPro: 'System',
  almarai: 'System',
  inter: 'System',
} as const;

// Mirrors AppTheme.lightTheme textTheme (Flutter TextTheme slots).
export const TextStyles = {
  // titleLarge
  titleLarge: { fontSize: sp(24), fontWeight: '800', color: AppColors.textColorTheme } as TextStyle,
  // displayMedium (headline1)
  displayMedium: { fontSize: sp(28), fontWeight: '400', color: AppColors.textColorTheme } as TextStyle,
  // displaySmall (headline2)
  displaySmall: { fontSize: sp(22), fontWeight: '500', color: AppColors.textColorTheme } as TextStyle,
  // headlineMedium (headline3)
  headlineMedium: { fontSize: sp(18), fontWeight: '500', color: AppColors.textColorTheme } as TextStyle,
  // bodyMedium (bodyText1)
  bodyMedium: { fontSize: sp(16), fontWeight: '400', color: AppColors.textColorTheme } as TextStyle,
  // bodyLarge (button text)
  bodyLarge: { fontSize: sp(18), fontWeight: '700', color: AppColors.textColorTheme } as TextStyle,
  // bodySmall (text field + hint)
  bodySmall: { fontSize: sp(14), fontWeight: '500', color: AppColors.textColorTheme } as TextStyle,
  // labelLarge (caption / error)
  labelLarge: { fontSize: sp(12), fontWeight: '400', color: AppColors.textColorTheme } as TextStyle,
  // labelMedium
  labelMedium: { fontSize: sp(10), fontWeight: '700', color: AppColors.onTertiaryColor } as TextStyle,
} as const;
