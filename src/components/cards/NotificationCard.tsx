// Ported from screens/profile_screens/widgets/notification_card.dart (NotificationCard)
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppColors, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { AppImage, BaseText } from '@/components';
import { Res } from '@/lib/assets';
import { NotificationModel } from '@/types/notification';

export interface NotificationCardProps {
  notification: NotificationModel;
  onPress?: () => void;
}

// Mirrors DateFormatFunc.formatMonNameDayNumYearNumHourNumMinNumAmPm
// (core/functions/date_format_func.dart) -> "MMM - dd - yyyy hh:mm a"
function formatMonNameDayNumYearNumHourNumMinNumAmPm(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const pad = (n: number) => n.toString().padStart(2, '0');
  const mon = months[date.getMonth()];
  const day = pad(date.getDate());
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${mon} - ${day} - ${year} ${pad(hours)}:${minutes} ${ampm}`;
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              notification.read === true
                ? AppColors.white
                : AppColors.primaryColorTheme + '1E', // withAlpha(30)
          },
        ]}
      >
        <View style={styles.row}>
          {/* Notification Icon with badge */}
          <AppImage
            source={Res.appleIcon}
            style={styles.icon}
          />
          <View style={{ width: Responsive.gapSmall }} />

          {/* Notification Content */}
          <View style={styles.content}>
            {/* Title */}
            {/* <BaseText
              title={getNotificationType(notification.type ?? '').name}
              style={TextStyles.headlineMedium}
            /> */}
            <View style={{ height: Responsive.gapTiny }} />

            {/* Timestamp */}
            <BaseText
              title={formatMonNameDayNumYearNumHourNumMinNumAmPm(
                new Date(notification.createdAt ?? ''),
              )}
              style={[TextStyles.labelLarge, { color: AppColors.darkGray }]}
            />

            <View style={{ height: Responsive.gapTiny }} />

            {/* Message */}
            <BaseText
              title={notification.message ?? ''}
              style={TextStyles.bodyMedium}
              numberOfLines={1}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Responsive.paddingSmall,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    width: Responsive.iconXLarge,
    height: Responsive.iconLarge,
  },
  content: {
    alignItems: 'flex-start',
  },
});

export default NotificationCard;
