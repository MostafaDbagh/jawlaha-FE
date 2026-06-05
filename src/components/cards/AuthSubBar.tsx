// Ported from screens/auth/widgets/auth_sub_bar.dart (SubAppBar)
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, TextStyles, screenWidth } from '@/theme';
import { quicksand } from '@/theme/typography';
import { Responsive } from '@/theme/responsive';
import { BaseText, AppImage } from '@/components';

// Mirrors ResponsiveUtils.getResponsiveFontSize(context, scale: 1.05)
function getResponsiveFontSize(scale?: number): number {
  let baseSize: number;
  if (screenWidth < Responsive.mobileBreakpoint) {
    baseSize = Responsive.textLarge; // responsiveTextLarge (16)
  } else if (screenWidth < Responsive.tabletBreakpoint) {
    baseSize = Responsive.textXLarge; // responsiveTextLarge -> XLarge on tablet
  } else {
    baseSize = Responsive.textXXLarge; // responsiveTextXLarge
  }
  return scale != null ? baseSize * scale : baseSize;
}

// Mirrors ResponsiveUtils.getResponsiveIconSize(context)
function getResponsiveIconSize(): number {
  if (screenWidth < Responsive.mobileBreakpoint) {
    return Responsive.iconSmall;
  } else if (screenWidth < Responsive.tabletBreakpoint) {
    return Responsive.iconMedium;
  }
  return Responsive.iconLarge;
}

export interface AuthSubBarProps {
  title: string;
  textSize?: number;
  fontWeight?: import('react-native').TextStyle['fontWeight'];
  arrowBackFunc?: () => void;
  onPress?: () => void;
  actions?: React.ReactNode;
  bottom?: React.ReactNode;
  needLeading?: boolean;
  arrowColor?: string;
  arrowBackIcon?: import('expo-image').ImageSource | string | number;
}

export function AuthSubBar({
  title,
  textSize,
  fontWeight,
  arrowBackFunc,
  onPress,
  actions,
  bottom,
  needLeading = true,
  arrowColor,
  arrowBackIcon,
}: AuthSubBarProps) {
  const router = useRouter();

  const iconSize = getResponsiveIconSize();

  return (
    <View>
      <View style={styles.bar}>
        {/* leading */}
        {needLeading ? (
          <Pressable
            onPress={arrowBackFunc ?? (() => router.back())}
            hitSlop={8}
            style={styles.leadingButton}
          >
            {arrowBackIcon == null ? (
              <Ionicons
                name="arrow-back"
                size={iconSize * 1.25}
                color={arrowColor ?? AppColors.textColorTheme}
              />
            ) : (
              <AppImage
                source={arrowBackIcon}
                width={iconSize * 1.2}
                height={iconSize * 1.2}
                contentFit="contain"
              />
            )}
          </Pressable>
        ) : (
          <View style={{ width: iconSize * 1.25 }} />
        )}

        {/* title */}
        <Pressable onPress={onPress} style={styles.titleWrap}>
          <BaseText
            title={title}
            style={[
              TextStyles.bodyMedium,
              {
                fontSize: textSize ?? getResponsiveFontSize(1.05),
                ...(fontWeight ? { fontFamily: quicksand(fontWeight) } : {}),
              },
            ]}
          />
        </Pressable>

        {/* actions */}
        {actions != null ? (
          <View style={styles.actions}>{actions}</View>
        ) : null}
      </View>

      {/* bottom */}
      {bottom}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56, // kToolbarHeight
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.transparent,
  },
  leadingButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrap: {
    flex: 1, // titleSpacing: 0 -> title takes available space
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AuthSubBar;
