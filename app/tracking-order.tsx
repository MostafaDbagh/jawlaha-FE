// Ported from lib/screens/cart/tracking_order_screen.dart (TrackingOrderScreen)
import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { t } from '@/i18n';
import { BaseText, AppImage } from '@/components';
import { formatPrice } from '@/lib/currency';
import { showSnack } from '@/lib/snack';
import { useNavArgs } from '@/store/navArgs';
import { useOrdersStore } from '@/features/orders/ordersStore';

// Canonical order flow + the i18n key for each step's label. The timeline's
// completed state is derived from the order's current `status` (not the stored
// status_timeline flags), so the UI always reflects the real status — and the
// labels render in the app language instead of the backend's English strings.
const TIMELINE_STEPS: { status: string; labelKey: string }[] = [
  { status: 'pending', labelKey: 'order_placed' },
  { status: 'preparing', labelKey: 'preparing' },
  { status: 'ready', labelKey: 'ready_to_pick_up' },
  { status: 'on_the_way', labelKey: 'on_its_way' },
  { status: 'delivered', labelKey: 'delivered' },
];
const ORDER_FLOW = TIMELINE_STEPS.map((s) => s.status);
const POLL_MS = 15000;

function TimelineStep({
  title,
  subtitle,
  isCompleted,
  isLast,
}: {
  title: string;
  subtitle: string;
  isCompleted: boolean;
  isLast: boolean;
}) {
  const nodeColor = isCompleted ? AppColors.primaryColor : AppColors.lightGreyV2;
  const lineColor = isCompleted ? AppColors.primaryColor : AppColors.lightGreyV2;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      {/* Node Line */}
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: w(12),
            height: w(12),
            borderRadius: w(6),
            backgroundColor: nodeColor,
          }}
        />
        {!isLast && (
          <View style={{ width: w(2), height: h(40), backgroundColor: lineColor }} />
        )}
      </View>
      <View style={{ width: w(12) }} />
      {/* Content */}
      <View style={{ flex: 1 }}>
        <BaseText
          title={title}
          style={{
            fontSize: sp(16),
            fontFamily: quicksand('600'),
            color: isCompleted
              ? AppColors.primaryColor
              : AppColors.textColorTheme,
          }}
        />
        {!!subtitle && (
          <BaseText
            title={subtitle}
            style={{ fontSize: sp(12), color: AppColors.textColor2 }}
          />
        )}
        {!isLast && <View style={{ height: h(24) }} />}
      </View>
    </View>
  );
}

function formatTime(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en', { hour: 'numeric', minute: '2-digit' });
}

export default function TrackingOrderScreen() {
  const router = useRouter();
  const screenHeight = Dimensions.get('window').height;

  const args = useNavArgs((s) => s.args);
  const orderId = args?.orderId as string | undefined;

  const order = useOrdersStore((s) => s.currentOrder);
  const isLoading = useOrdersStore((s) => s.isLoading);

  useEffect(() => {
    if (!orderId) return;
    // Initial load (shows the spinner), then poll silently so status changes
    // pushed by the restaurant/driver appear without reopening the screen.
    useOrdersStore.getState().loadOrder(orderId);
    const timer = setInterval(() => {
      useOrdersStore.getState().refreshOrder(orderId);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [orderId]);

  // Derive each step's completed state from the order's current status, plus
  // the timestamp for that step from the backend timeline when available.
  const atByStatus = new Map(
    (order?.status_timeline ?? []).map((s) => [s.status, s.at] as const),
  );
  const currentIdx = ORDER_FLOW.indexOf(order?.status ?? 'pending');
  const timeline = TIMELINE_STEPS.map((s, i) => ({
    title: t(s.labelKey),
    subtitle: formatTime(atByStatus.get(s.status) ?? null),
    done: i <= currentIdx,
  }));
  const eta = order?.eta_minutes;
  const driver = order?.driver ?? null;
  const items = order?.items ?? [];
  // No driver is dispatched until the restaurant marks the order "ready", so
  // before then show a calm "assigned when ready" note instead of an endless
  // "finding a driver…" spinner (which reads as something being stuck/wrong).
  const beforeReady = ORDER_FLOW.indexOf(order?.status ?? 'pending') < ORDER_FLOW.indexOf('ready');

  // Dial the assigned driver. Cash-on-delivery means the customer often needs to
  // reach the driver directly, so this is wired to both the number and the
  // Call button below.
  const callDriver = () => {
    const number = String(driver?.phone ?? '').replace(/\s/g, '');
    if (!number) {
      showSnack(t('calling_driver'), 'info');
      return;
    }
    Linking.openURL(`tel:${number}`).catch(() => showSnack(number, 'info'));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={{ flex: 1 }}>
        {/* Map Background (placeholder) */}
        <View style={styles.mapPlaceholder}>
          <MaterialIcons
            name="map"
            size={r(64)}
            color={AppColors.lightGreyV2}
          />
          {/* driver marker */}
          <View style={styles.markerWrap}>
            <Ionicons name="location-sharp" size={r(40)} color="orange" />
          </View>
        </View>

        {/* Live map coming soon — chip sits in the visible map area below the
            app bar (the sheet covers the lower half). */}
        <View style={styles.comingSoonWrap} pointerEvents="none">
          <View style={styles.comingSoonChip}>
            <MaterialIcons
              name="schedule"
              size={sp(13)}
              color={AppColors.primaryColor}
            />
            <View style={{ width: w(6) }} />
            <BaseText
              title={t('coming_soon')}
              size={sp(12)}
              fontWeight="600"
              color={AppColors.primaryColor}
            />
          </View>
        </View>

        {/* App Bar (white translucent, centered bold title) */}
        <View style={styles.appBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.appBarLeading}
          >
            <Ionicons name="arrow-back" size={r(24)} color={AppColors.black} />
          </Pressable>
          <BaseText
            title={t('order_tracking')}
            style={{
              color: AppColors.black,
              fontSize: sp(18),
              fontFamily: quicksand('bold'),
            }}
          />
          <View style={{ width: r(24) }} />
        </View>

        {/* Draggable Details Sheet (fixed-height fallback) */}
        <View style={[styles.sheet, { height: screenHeight * 0.6 }]}>
          {isLoading && !order ? (
            <View style={styles.centerFill}>
              <ActivityIndicator color={AppColors.primaryColor} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: w(16) }}>
              {/* Grabber */}
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: w(40),
                    height: h(4),
                    borderRadius: r(2),
                    backgroundColor: AppColors.lightGreyV2,
                  }}
                />
              </View>
              <View style={{ height: h(16) }} />

              {/* Time Estimate */}
              {eta != null && (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <BaseText
                      title={`${eta} ${t('mins_until_delivery')}`}
                      style={{
                        fontSize: sp(18),
                        fontFamily: quicksand('bold'),
                        color: AppColors.black,
                      }}
                    />
                  </View>
                  <View style={{ height: h(24) }} />
                </>
              )}

              {/* Timeline */}
              {timeline.map((step, index) => (
                <TimelineStep
                  key={index}
                  title={step.title}
                  subtitle={step.subtitle}
                  isCompleted={step.done}
                  isLast={index === timeline.length - 1}
                />
              ))}

              <View style={styles.divider} />
              <View style={{ height: h(16) }} />

              {/* Driver section — always shown so the customer knows where the
                  driver's details will appear. Cash-on-delivery makes reaching
                  the driver important, so the name + phone number are front and
                  centre, with the number itself tappable to dial. */}
              <BaseText
                title={t('your_driver')}
                style={{
                  fontSize: sp(16),
                  fontFamily: quicksand('bold'),
                  color: AppColors.black,
                }}
              />
              <View style={{ height: h(12) }} />

              {driver ? (
                <View style={styles.driverCard}>
                  <AppImage
                    source={driver.avatar || ''}
                    width={r(52)}
                    height={r(52)}
                    borderRadius={r(26)}
                    style={styles.avatar}
                  />
                  <View style={{ width: w(12) }} />
                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    <BaseText
                      title={driver.name ?? ''}
                      style={{
                        fontFamily: quicksand('bold'),
                        fontSize: sp(16),
                        color: AppColors.black,
                      }}
                    />
                    {!!driver.vehicle && (
                      <>
                        <View style={{ height: h(2) }} />
                        <BaseText
                          title={driver.vehicle}
                          style={{ fontSize: sp(12), color: AppColors.textColor2 }}
                        />
                      </>
                    )}
                    {!!driver.phone && (
                      <>
                        <View style={{ height: h(6) }} />
                        <BaseText
                          title={t('driver_phone')}
                          style={{ fontSize: sp(11), color: AppColors.textColor2 }}
                        />
                        <Pressable
                          onPress={callDriver}
                          hitSlop={6}
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Ionicons
                            name="call"
                            size={sp(15)}
                            color={AppColors.primaryColor}
                          />
                          <View style={{ width: w(6) }} />
                          <BaseText
                            title={driver.phone}
                            style={{
                              fontFamily: quicksand('bold'),
                              fontSize: sp(16),
                              color: AppColors.primaryColor,
                            }}
                          />
                        </Pressable>
                      </>
                    )}
                  </View>
                  {!!driver.phone && (
                    <Pressable onPress={callDriver} style={styles.callButton}>
                      <Ionicons name="call" size={sp(16)} color={AppColors.white} />
                      <BaseText
                        title={t('call_driver')}
                        style={{
                          color: AppColors.white,
                          fontSize: sp(11),
                          marginLeft: w(4),
                          fontFamily: quicksand('600'),
                        }}
                      />
                    </Pressable>
                  )}
                </View>
              ) : beforeReady ? (
                <View style={styles.driverPlaceholder}>
                  <Ionicons
                    name="information-circle-outline"
                    size={sp(20)}
                    color={AppColors.primaryColor}
                  />
                  <View style={{ width: w(12) }} />
                  <BaseText
                    title={t('driver_assigned_when_ready')}
                    style={{ fontSize: sp(13), color: AppColors.textColor2, flex: 1 }}
                  />
                </View>
              ) : (
                <View style={styles.driverPlaceholder}>
                  <ActivityIndicator color={AppColors.primaryColor} size="small" />
                  <View style={{ width: w(12) }} />
                  <BaseText
                    title={t('finding_driver')}
                    style={{ fontSize: sp(14), color: AppColors.textColor2, flex: 1 }}
                  />
                </View>
              )}

              <View style={{ height: h(24) }} />
              <BaseText
                title={t('order_summary')}
                style={{
                  fontSize: sp(16),
                  fontFamily: quicksand('bold'),
                  color: AppColors.black,
                }}
              />
              <View style={{ height: h(12) }} />

              {/* Summary Items */}
              {items.map((item, idx) => (
                <View
                  key={item.product_id ?? idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: h(12),
                  }}
                >
                  <AppImage
                    source={item.image || ''}
                    width={w(50)}
                    height={w(50)}
                    borderRadius={r(8)}
                    style={styles.summaryImage}
                  />
                  <View style={{ width: w(12) }} />
                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    <BaseText
                      title={order?.vendor_name ?? item.name}
                      style={{
                        fontFamily: quicksand('bold'),
                        fontSize: sp(14),
                        color: AppColors.black,
                      }}
                    />
                    <BaseText
                      title={`${item.qty} x ${item.name}`}
                      style={{ fontSize: sp(12), color: AppColors.textColor2 }}
                    />
                    {Array.isArray(item.options) && item.options.length > 0 && (
                      <BaseText
                        title={item.options.map((o: any) => o?.name).filter(Boolean).join('، ')}
                        style={{ fontSize: sp(11), color: AppColors.textColor2 }}
                      />
                    )}
                  </View>
                  <BaseText
                    title={formatPrice(item.unit_price * item.qty)}
                    style={{
                      fontFamily: quicksand('bold'),
                      fontSize: sp(14),
                      color: AppColors.black,
                    }}
                  />
                </View>
              ))}

              <View style={{ height: h(8) }} />
              {/* Back to Home — lets the customer leave tracking and return to
                  the home tab (resets the post-checkout stack). */}
              <Pressable
                onPress={() => router.replace('/(tabs)')}
                style={styles.homeButton}
              >
                <Ionicons name="home-outline" size={sp(18)} color={AppColors.white} />
                <View style={{ width: w(8) }} />
                <BaseText
                  title={t('back_to_home')}
                  style={{
                    color: AppColors.white,
                    fontFamily: quicksand('bold'),
                    fontSize: sp(16),
                  }}
                />
              </Pressable>
              <View style={{ height: h(24) }} />
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  mapPlaceholder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: AppColors.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerWrap: {
    position: 'absolute',
  },
  comingSoonWrap: {
    position: 'absolute',
    top: h(72),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  comingSoonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    paddingHorizontal: w(12),
    paddingVertical: h(6),
    borderRadius: r(16),
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(14),
    height: h(52),
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: w(8),
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  appBarLeading: {
    padding: w(8),
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: r(24),
    borderTopRightRadius: r(24),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.lightGreyV2,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: w(12),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(12),
  },
  avatar: {
    backgroundColor: AppColors.lightGreyV2,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(12),
    minHeight: h(36),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(20),
  },
  driverPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: w(14),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(12),
    backgroundColor: AppColors.backgroundColor,
  },
  summaryImage: {
    backgroundColor: AppColors.lightGreyV2,
  },
});
