// Ported from: lib/screens/profile_screens/notification_screen.dart
import React, { useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppBar } from '@/components';
import { NotificationCard } from '@/components/cards';
import { useProfileStore } from '@/features/profile/profileStore';

// Mirrors core/widgets/progressIndicator/custom_progress_indicator_for_pagination.dart
function CustomProgressIndicatorForPagination() {
  return (
    <View style={styles.progressCenter}>
      <ActivityIndicator
        size="small"
        color={AppColors.primaryColorTheme}
      />
    </View>
  );
}

// Mirrors core/widgets/list_views/custom_divider_separator.dart
function CustomDividerSeparator() {
  return (
    <View style={styles.separatorPadding}>
      <View style={styles.divider} />
    </View>
  );
}

export default function NotificationScreen() {
  const notificationsPage = useProfileStore((s) => s.notificationsPage);
  // Guard so the initState fetch only runs once (mirrors initState()).
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    useProfileStore.getState().getNotifications();
    // scrollController.addListener(...) -> handled via FlatList onEndReached below
  }, []);

  const data = notificationsPage.data ?? [];
  const itemCount =
    data.length + (notificationsPage.paginateLoading ? 1 : 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      {/* appBar: SubAppBar(title: LocalKeys.notifications.tr) */}
      <AppBar title={t('notifications')} />

      {/* body */}
      {notificationsPage.loading ? (
        <CustomProgressIndicatorForPagination />
      ) : (
        <FlatList
          data={Array.from({ length: itemCount }, (_, i) => i)}
          keyExtractor={(index) => `notification-${index}`}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={CustomDividerSeparator}
          onEndReached={() => {
            useProfileStore.getState().getNotifications();
          }}
          onEndReachedThreshold={0.1}
          renderItem={({ item: index }) => {
            const page = notificationsPage;

            if (page.paginateLoading && index === (page.data?.length ?? 0)) {
              return <CustomProgressIndicatorForPagination />;
            }

            const item = page.data![index];

            return <NotificationCard notification={item} onPress={undefined} />;
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  // ResponsiveUtils.getResponsivePadding(context).copyWith(
  //   top: responsiveGapLarge, bottom: responsiveGapTiny)
  listContent: {
    paddingHorizontal: Responsive.getResponsivePadding().paddingHorizontal,
    paddingTop: Responsive.gapLarge,
    paddingBottom: Responsive.gapTiny,
  },
  progressCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.gap,
  },
  separatorPadding: {
    paddingVertical: Responsive.gap,
  },
  divider: {
    height: 0.5,
    backgroundColor: AppColors.lightGray,
  },
});
