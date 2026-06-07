// Ported from: lib/screens/home/order_details_screen.dart
import React, { useEffect } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText, AppImage } from '@/components';
import { formatPrice } from '@/lib/currency';
import { navArgs, useNavArgs } from '@/store/navArgs';
import { useOrdersStore, type OrderItem } from '@/features/orders/ordersStore';

function MapPlaceholder() {
  return (
    <View style={styles.mapPlaceholder}>
      <MaterialIcons
        name="location-pin"
        size={sp(28)}
        color={AppColors.primaryColor}
      />
    </View>
  );
}

function statusLabel(status: string): string {
  switch (status) {
    case 'delivered':
      return t('delivered');
    case 'cancelled':
      return t('cancelled');
    case 'pending':
      return t('pending');
    case 'on_the_way':
      return t('on_its_way');
    default:
      return status;
  }
}

function formatDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function StoreItemBlock({
  storeName,
  items,
}: {
  storeName: string;
  items: OrderItem[];
}) {
  return (
    <View style={{ alignItems: 'flex-start' }}>
      {/* Store header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.storeAvatar}>
          <MaterialIcons
            name="store"
            size={sp(14)}
            color={AppColors.primaryColor}
          />
        </View>
        <View style={{ width: w(8) }} />
        <BaseText
          title={storeName}
          size={sp(14)}
          fontWeight="500"
        />
      </View>
      <View style={{ height: h(8) }} />
      <View style={styles.itemsContainer}>
        {items.map((item, idx) => (
          <View
            key={item.product_id ?? idx}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: h(8),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <AppImage
                source={item.image || ''}
                width={r(36)}
                height={r(36)}
                borderRadius={r(8)}
                style={styles.itemImage}
              />
              <View style={{ width: w(8) }} />
              <BaseText
                title={`${item.name} x${item.qty}`}
                size={sp(14)}
                color={AppColors.black}
              />
            </View>
            <BaseText
              title={formatPrice(item.unit_price)}
              size={sp(14)}
              fontWeight="bold"
              color={AppColors.black}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function SummaryRow({
  title,
  value,
  isBold = false,
}: {
  title: string;
  value: string;
  isBold?: boolean;
}) {
  return (
    <View
      style={{ flexDirection: 'row', justifyContent: 'space-between' }}
    >
      <BaseText
        title={title}
        size={sp(14)}
        color={isBold ? AppColors.black : AppColors.textColor2}
        fontWeight={isBold ? 'bold' : 'normal'}
      />
      <BaseText
        title={value}
        size={sp(14)}
        color={AppColors.black}
        fontWeight={isBold ? 'bold' : 'normal'}
      />
    </View>
  );
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const args = useNavArgs((s) => s.args);
  const orderId = args?.orderId as string | undefined;

  const order = useOrdersStore((s) => s.currentOrder);
  const isLoading = useOrdersStore((s) => s.isLoading);

  useEffect(() => {
    if (orderId) useOrdersStore.getState().loadOrder(orderId);
  }, [orderId]);

  const canTrack =
    !!order && order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: AppColors.backgroundColor }}
      edges={['top']}
    >
      {/* AppBar: back arrow, no title, white bg, no elevation */}
      <View style={styles.appBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={sp(24)} color={AppColors.black} />
        </Pressable>
      </View>

      {isLoading && !order ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={AppColors.primaryColor} />
        </View>
      ) : !order ? (
        <View style={styles.centerFill}>
          <BaseText
            title={t('no_orders')}
            size={sp(14)}
            color={AppColors.textColor2}
            textAlign="center"
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: w(16),
            paddingVertical: h(8),
          }}
        >
          <View style={{ alignItems: 'flex-start' }}>
            {/* Header */}
            <View style={styles.fullRowBetween}>
              <BaseText
                title={`#${order.order_id}`}
                size={sp(16)}
                fontWeight="bold"
                color={AppColors.black}
              />
              <BaseText
                title={statusLabel(order.status)}
                size={sp(14)}
                fontWeight="500"
                color={
                  order.status === 'cancelled'
                    ? AppColors.red
                    : AppColors.primaryColor
                }
              />
            </View>
            <View style={{ height: h(4) }} />
            <BaseText
              title={formatDate(order.created_at)}
              size={sp(12)}
              color={AppColors.textColor2}
            />
            <View style={{ height: h(24) }} />

            {/* Stores & Items */}
            <BaseText
              title={t('stores_and_items')}
              size={sp(16)}
              fontWeight="bold"
              color={AppColors.black}
            />
            <View style={{ height: h(16) }} />
            <View style={{ alignSelf: 'stretch' }}>
              <StoreItemBlock
                storeName={order.vendor_name ?? ''}
                items={order.items}
              />
            </View>
            <View style={{ height: h(24) }} />

            {/* Delivery Info */}
            <BaseText
              title={t('delivery_info')}
              size={sp(16)}
              fontWeight="bold"
              color={AppColors.black}
            />
            <View style={{ height: h(12) }} />
            {order.driver ? (
              <View style={styles.deliveryInfoCard}>
                <AppImage
                  source={order.driver.avatar || ''}
                  width={r(40)}
                  height={r(40)}
                  borderRadius={r(20)}
                  style={styles.avatar}
                />
                <View style={{ width: w(12) }} />
                <View style={{ flex: 1 }}>
                  <View style={styles.fullRowBetween}>
                    <BaseText
                      title={order.driver.name ?? ''}
                      size={sp(14)}
                      fontWeight="bold"
                    />
                    {!!order.driver.rating && (
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <BaseText title={order.driver.rating} size={sp(12)} />
                        <MaterialIcons
                          name="star-border"
                          size={sp(14)}
                          color="orange"
                        />
                      </View>
                    )}
                  </View>
                  {!!order.driver.vehicle && (
                    <BaseText
                      title={order.driver.vehicle}
                      size={sp(12)}
                      color={AppColors.textColor2}
                    />
                  )}
                </View>
              </View>
            ) : null}

            {/* Payment method + delivery preferences */}
            <View style={styles.preferencesCard}>
              <SummaryRow
                title={t('payment_methods_label')}
                value={t('cash_on_delivery')}
              />
              {order.leave_at_door ? (
                <View style={styles.prefRow}>
                  <MaterialIcons
                    name="check-circle"
                    size={sp(16)}
                    color={AppColors.primaryColor}
                  />
                  <View style={{ width: w(8) }} />
                  <BaseText
                    title={t('leave_at_door')}
                    size={sp(13)}
                    color={AppColors.textColorTheme}
                  />
                </View>
              ) : null}
              {order.dont_ring_bell ? (
                <View style={styles.prefRow}>
                  <MaterialIcons
                    name="check-circle"
                    size={sp(16)}
                    color={AppColors.primaryColor}
                  />
                  <View style={{ width: w(8) }} />
                  <BaseText
                    title={t('dont_ring_bell')}
                    size={sp(13)}
                    color={AppColors.textColorTheme}
                  />
                </View>
              ) : null}
            </View>
            <View style={{ height: h(24) }} />

            {/* Payment Summary */}
            <BaseText
              title={t('payment_summary')}
              size={sp(16)}
              fontWeight="bold"
              color={AppColors.black}
            />
            <View style={{ height: h(12) }} />
            <View style={styles.summaryCard}>
              <SummaryRow
                title={t('subtotal')}
                value={formatPrice(order.subtotal)}
              />
              <View style={{ height: h(8) }} />
              <SummaryRow
                title={t('delivery_fee')}
                value={formatPrice(order.delivery_fee)}
              />
              {order.discount > 0 ? (
                <>
                  <View style={{ height: h(8) }} />
                  <SummaryRow
                    title={t('discount')}
                    value={`- ${formatPrice(order.discount)}`}
                  />
                </>
              ) : null}
              <View style={styles.divider} />
              <SummaryRow
                title={t('total')}
                value={formatPrice(order.total)}
                isBold
              />
            </View>
            <View style={{ height: h(24) }} />

            {/* Delivery Address */}
            <BaseText
              title={t('delivery_address_label')}
              size={sp(16)}
              fontWeight="bold"
              color={AppColors.black}
            />
            <View style={{ height: h(12) }} />
            <View style={styles.addressCard}>
              {/* Map Preview */}
              <View style={styles.mapWrap}>
                <MapPlaceholder />
              </View>
              <View style={{ padding: w(12) }}>
                <BaseText
                  title={order.delivery_address ?? ''}
                  size={sp(12)}
                  color={AppColors.black}
                />
                {!!order.delivery_note && (
                  <>
                    <View style={{ height: h(4) }} />
                    <BaseText
                      title={order.delivery_note}
                      size={sp(12)}
                      color={AppColors.textColor2}
                    />
                  </>
                )}
              </View>
            </View>
            <View style={{ height: h(32) }} />

            {/* Buttons */}
            {canTrack ? (
              <Pressable
                onPress={() => {
                  navArgs.set({ orderId: order.order_id });
                  router.push('/tracking-order');
                }}
                style={styles.primaryButton}
              >
                <BaseText
                  title={t('track_your_order')}
                  size={sp(16)}
                  color={AppColors.white}
                  fontWeight="bold"
                />
              </Pressable>
            ) : (
              <Pressable onPress={() => router.push('/(tabs)')} style={styles.primaryButton}>
                <BaseText
                  title={t('order_again')}
                  size={sp(16)}
                  color={AppColors.white}
                  fontWeight="bold"
                />
              </Pressable>
            )}

            {/* Report a problem with this order — pre-fills the complaint form
                with this order's reference number. */}
            <View style={{ height: h(12) }} />
            <Pressable
              onPress={() => {
                navArgs.set({
                  complaintOrderId: order.order_id,
                  complaintOrderRef: order.order_id.slice(0, 8),
                  complaintVendor: order.vendor_name ?? '',
                });
                router.push('/support-report');
              }}
              style={styles.reportButton}
            >
              <Ionicons
                name="alert-circle-outline"
                size={sp(18)}
                color={AppColors.secondMainColor}
              />
              <View style={{ width: w(8) }} />
              <BaseText
                title={t('report_order_problem')}
                size={sp(15)}
                color={AppColors.secondMainColor}
                fontWeight="600"
              />
            </Pressable>
            <View style={{ height: h(32) }} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(8),
    backgroundColor: AppColors.white,
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: w(16),
  },
  fullRowBetween: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeAvatar: {
    width: r(24),
    height: r(24),
    borderRadius: r(12),
    backgroundColor: AppColors.baserColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsContainer: {
    alignSelf: 'stretch',
    padding: w(12),
    backgroundColor: AppColors.baserColor,
    borderRadius: r(8),
  },
  itemImage: {
    backgroundColor: AppColors.lightGreyV2,
  },
  deliveryInfoCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    padding: w(12),
    backgroundColor: AppColors.baserColor,
    borderRadius: r(12),
  },
  avatar: {
    backgroundColor: AppColors.lightGreyV2,
  },
  preferencesCard: {
    alignSelf: 'stretch',
    marginTop: h(12),
    padding: w(16),
    backgroundColor: AppColors.baserColor,
    borderRadius: r(12),
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: h(8),
  },
  summaryCard: {
    alignSelf: 'stretch',
    padding: w(16),
    backgroundColor: AppColors.baserColor,
    borderRadius: r(12),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginVertical: h(12),
  },
  addressCard: {
    alignSelf: 'stretch',
    backgroundColor: AppColors.baserColor,
    borderRadius: r(12),
    overflow: 'hidden',
  },
  mapWrap: {
    height: h(120),
    borderTopLeftRadius: r(12),
    borderTopRightRadius: r(12),
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#D6E0E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    alignSelf: 'stretch',
    height: h(50),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButton: {
    alignSelf: 'stretch',
    height: h(48),
    borderRadius: r(8),
    borderWidth: 1,
    borderColor: AppColors.secondMainColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
