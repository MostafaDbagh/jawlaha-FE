// Ported from screens/profile_screens/widgets/profile_card.dart (ProfileCard)
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { AppColors, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { AppImage, BaseText } from '@/components';
import { Res } from '@/lib/assets';

// Mirrors Dart `ProfileCardEntity`
export interface ProfileCardEntity {
  icon: any;
  title: string;
  onPress: () => void;
  isLogout?: boolean;
}

export interface ProfileCardProps {
  profileCardEntity: ProfileCardEntity;
}

export function ProfileCard(props: ProfileCardProps) {
  const { icon, title, onPress, isLogout = false } = props.profileCardEntity;

  const tint = isLogout ? AppColors.red : AppColors.darkGray;
  const iconSize = Responsive.getResponsiveIconSize() * 1.4;

  return (
    <Pressable onPress={onPress}>
      <View style={styles.row}>
        <AppImage
          source={icon}
          color={tint}
          height={iconSize}
          width={iconSize}
        />
        <View style={{ width: Responsive.gapSmall }} />
        <BaseText
          title={title}
          style={[
            TextStyles.headlineMedium,
            {
              color: tint,
              fontSize: Responsive.getResponsiveFontSize({ scale: 1.05 }),
            },
          ]}
        />
        <View style={{ flex: 1 }} />
        <AppImage
          source={Res.appleIcon}
          color={tint}
          height={iconSize}
          width={iconSize}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ProfileCard;
