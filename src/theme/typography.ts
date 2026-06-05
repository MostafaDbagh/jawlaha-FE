import { TextStyle } from 'react-native';
import { AppColors } from './colors';
import { sp } from './scale';

// Quicksand is the app-wide font family. expo-google-fonts registers each weight
// under its own family name, so we pick the matching family per weight rather than
// relying on RN's fontWeight (custom fonts don't synthesize intermediate weights).
// Quicksand ships weights 300–700; heavier requested weights map to Bold (700).
export const QuicksandFamily = {
  light: 'Quicksand_300Light',
  regular: 'Quicksand_400Regular',
  medium: 'Quicksand_500Medium',
  semiBold: 'Quicksand_600SemiBold',
  bold: 'Quicksand_700Bold',
} as const;

/** Resolve the Quicksand family name that matches a given fontWeight. */
export function quicksand(weight?: TextStyle['fontWeight']): string {
  switch (weight) {
    case '100':
    case '200':
    case '300':
      return QuicksandFamily.light;
    case '500':
      return QuicksandFamily.medium;
    case '600':
      return QuicksandFamily.semiBold;
    case 'bold':
    case '700':
    case '800':
    case '900':
      return QuicksandFamily.bold;
    case 'normal':
    case '400':
    default:
      return QuicksandFamily.regular;
  }
}

// Font families. The whole app now renders in Quicksand.
export const Fonts = {
  sfPro: QuicksandFamily.regular,
  almarai: QuicksandFamily.regular,
  inter: QuicksandFamily.regular,
} as const;

// Mirrors AppTheme.lightTheme textTheme (Flutter TextTheme slots).
// Each slot carries its Quicksand family (weight baked into the family name).
export const TextStyles = {
  // titleLarge
  titleLarge: { fontSize: sp(24), fontFamily: quicksand('800'), color: AppColors.textColorTheme } as TextStyle,
  // displayMedium (headline1)
  displayMedium: { fontSize: sp(28), fontFamily: quicksand('400'), color: AppColors.textColorTheme } as TextStyle,
  // displaySmall (headline2)
  displaySmall: { fontSize: sp(22), fontFamily: quicksand('500'), color: AppColors.textColorTheme } as TextStyle,
  // headlineMedium (headline3)
  headlineMedium: { fontSize: sp(18), fontFamily: quicksand('500'), color: AppColors.textColorTheme } as TextStyle,
  // bodyMedium (bodyText1)
  bodyMedium: { fontSize: sp(16), fontFamily: quicksand('400'), color: AppColors.textColorTheme } as TextStyle,
  // bodyLarge (button text)
  bodyLarge: { fontSize: sp(18), fontFamily: quicksand('700'), color: AppColors.textColorTheme } as TextStyle,
  // bodySmall (text field + hint)
  bodySmall: { fontSize: sp(14), fontFamily: quicksand('500'), color: AppColors.textColorTheme } as TextStyle,
  // labelLarge (caption / error)
  labelLarge: { fontSize: sp(12), fontFamily: quicksand('400'), color: AppColors.textColorTheme } as TextStyle,
  // labelMedium
  labelMedium: { fontSize: sp(10), fontFamily: quicksand('700'), color: AppColors.onTertiaryColor } as TextStyle,
} as const;
