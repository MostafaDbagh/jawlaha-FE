// Ported from lib/screens/cart/tracking_order_screen.dart (TrackingOrderScreen)
import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
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
import {
  useOrdersStore,
  type TimelineStep as TimelineStepData,
} from '@/features/orders/ordersStore';

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
    if (orderId) useOrdersStore.getState().loadOrder(orderId);
  }, [orderId]);

  const timeline: TimelineStepData[] = order?.status_timeline ?? [];
  const eta = order?.eta_minutes;
  const driver = order?.driver ?? null;
  const items = order?.items ?? [];

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
                  title={step.label ?? step.status}
                  subtitle={formatTime(step.at)}
                  isCompleted={step.done}
                  isLast={index === timeline.length - 1}
                />
              ))}

              <View style={styles.divider} />
              <View style={{ height: h(16) }} />

              {/* Driver Card — only when a driver is assigned */}
              {driver ? (
                <View style={styles.driverCard}>
                  <AppImage
                    source={driver.avatar || ''}
                    width={r(48)}
                    height={r(48)}
                    borderRadius={r(24)}
                    style={styles.avatar}
                  />
                  <View style={{ width: w(12) }} />
                  <View style={{ alignItems: 'flex-start' }}>
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
                        <View style={{ height: h(4) }} />
                        <BaseText
                          title={driver.vehicle}
                          style={{ fontSize: sp(12), color: AppColors.textColor2 }}
                        />
                      </>
                    )}
                  </View>
                  <View style={{ flex: 1 }} />
                  <View style={{ alignItems: 'flex-end' }}>
                    {!!driver.rating && (
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Ionicons name="star" size={sp(16)} color="orange" />
                        <BaseText
                          title={driver.rating}
                          style={{
                            fontFamily: quicksand('bold'),
                            fontSize: sp(14),
                            color: AppColors.black,
                          }}
                        />
                      </View>
                    )}
                    <View style={{ height: h(8) }} />
                    <Pressable onPress={() => showSnack(t('calling_driver'), 'info')} style={styles.callButton}>
                      <Ionicons
                        name="call"
                        size={sp(14)}
                        color={AppColors.primaryColor}
                      />
                      <BaseText
                        title={t('call_driver')}
                        style={{
                          color: AppColors.primaryColor,
                          fontSize: sp(10),
                          marginLeft: w(4),
                        }}
                      />
                    </Pressable>
                  </View>
                </View>
              ) : null}

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
              <View style={{ height: h(30) }} />
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
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: w(8),
    minHeight: h(24),
    borderWidth: 1,
    borderColor: AppColors.primaryColor,
    borderRadius: r(20),
  },
  summaryImage: {
    backgroundColor: AppColors.lightGreyV2,
  },
});
