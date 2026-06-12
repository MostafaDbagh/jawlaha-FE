// Ported from: lib/screens/home/order_details_screen.dart
import React, { useEffect } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { goBack } from '@/lib/nav';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText, AppImage } from '@/components';
import { formatPrice } from '@/lib/currency';
import { showSnack } from '@/lib/snack';
import { navArgs, useNavArgs } from '@/store/navArgs';
import { useOrdersStore, type OrderItem } from '@/features/orders/ordersStore';

// A soft tint of the brand color, reused for icon chips so they read as
// "branded" without the heavy flat-grey look the screen had before.
const PRIMARY_TINT = 'rgba(35,90,94,0.10)';

function ComingSoonChip() {
  return (
    <View style={styles.comingSoonChip}>
      <MaterialIcons name="schedule" size={sp(12)} color={AppColors.primaryColor} />
      <View style={{ width: w(4) }} />
      <BaseText
        title={t('coming_soon')}
        size={sp(11)}
        fontWeight="600"
        color={AppColors.primaryColor}
      />
    </View>
  );
}

function MapPlaceholder() {
  return (
    <View style={styles.mapPlaceholder}>
      <View style={styles.mapPinCircle}>
        <MaterialIcons
          name="location-pin"
          size={sp(22)}
          color={AppColors.primaryColor}
        />
      </View>
      <View style={{ height: h(8) }} />
      <ComingSoonChip />
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
    case 'preparing':
      return t('preparing');
    case 'ready':
      return t('ready_to_pick_up');
    case 'on_the_way':
      return t('on_its_way');
    default:
      return status;
  }
}

// Foreground color of the status pill.
function statusColor(status: string): string {
  if (status === 'cancelled') return AppColors.red;
  if (status === 'delivered') return AppColors.primaryColor;
  if (status === 'ready' || status === 'on_the_way') return AppColors.green;
  return AppColors.orange;
}

// Soft tinted background behind the status pill, matched to statusColor.
function statusTint(status: string): string {
  if (status === 'cancelled') return AppColors.cancelledColor;
  if (status === 'delivered') return PRIMARY_TINT;
  if (status === 'ready' || status === 'on_the_way') return AppColors.completedColor;
  return 'rgba(218,108,39,0.14)';
}

// Backend order ids are long UUIDs; show a compact upper-cased prefix so the
// header stays on one line next to the status pill (matches order history).
function formatOrderId(id: string): string {
  if (id.length > 12 && id.includes('-')) {
    return id.split('-')[0].toUpperCase();
  }
  return id;
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

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />
      <View style={{ width: w(8) }} />
      <BaseText
        title={title}
        size={sp(16)}
        fontWeight="bold"
        color={AppColors.black}
      />
    </View>
  );
}

function StoreItemBlock({
  storeName,
  items,
}: {
  storeName: string;
  items: OrderItem[];
}) {
  return (
    <View style={styles.storeCard}>
      {/* Store header row */}
      <View style={styles.storeHeaderRow}>
        <View style={styles.storeAvatar}>
          <MaterialIcons
            name="storefront"
            size={sp(18)}
            color={AppColors.primaryColor}
          />
        </View>
        <View style={{ width: w(10) }} />
        <BaseText
          title={storeName || t('restaurants')}
          size={sp(15)}
          fontWeight="bold"
          color={AppColors.black}
          numberOfLines={1}
          style={{ flexShrink: 1 }}
        />
      </View>
      <View style={styles.cardDivider} />
      {items.map((item, idx) => (
        <View key={item.product_id ?? idx}>
          <View style={styles.itemRow}>
            <View style={styles.itemRowLeft}>
              <AppImage
                source={item.image || ''}
                width={r(44)}
                height={r(44)}
                borderRadius={r(10)}
                style={styles.itemImage}
              />
              <View style={{ width: w(10) }} />
              <View style={{ flexShrink: 1 }}>
                <BaseText
                  title={`${item.name} x${item.qty}`}
                  size={sp(14)}
                  color={AppColors.black}
                  numberOfLines={2}
                />
                {(() => {
                  const addOns = Array.isArray(item.options)
                    ? item.options.map((o: any) => o?.name).filter(Boolean).join('، ')
                    : '';
                  const note =
                    typeof item.note === 'string' && item.note.trim() ? `"${item.note.trim()}"` : '';
                  const sub = [addOns, note].filter(Boolean).join(' • ');
                  return sub ? (
                    <BaseText
                      title={sub}
                      size={sp(12)}
                      color={AppColors.textColor2}
                      numberOfLines={3}
                      style={{ marginTop: h(2) }}
                    />
                  ) : null;
                })()}
              </View>
            </View>
            <View style={{ width: w(8) }} />
            <BaseText
              title={formatPrice(item.unit_price)}
              size={sp(14)}
              fontWeight="bold"
              color={AppColors.black}
            />
          </View>
          {idx < items.length - 1 ? <View style={styles.itemDivider} /> : null}
        </View>
      ))}
    </View>
  );
}

function SummaryRow({
  title,
  value,
  isBold = false,
  large = false,
}: {
  title: string;
  value: string;
  isBold?: boolean;
  large?: boolean;
}) {
  const size = large ? sp(16) : sp(14);
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <BaseText
        title={title}
        size={size}
        color={isBold ? AppColors.black : AppColors.textColor2}
        fontWeight={isBold ? 'bold' : 'normal'}
      />
      <BaseText
        title={value}
        size={size}
        color={large ? AppColors.primaryColor : AppColors.black}
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

  // Dial the driver from the order's saved snapshot (Cash on Delivery means the
  // customer often needs to reach the driver directly).
  const callDriver = () => {
    const number = String(order?.driver?.phone ?? '').replace(/\s/g, '');
    if (!number) {
      showSnack(t('calling_driver'), 'info');
      return;
    }
    Linking.openURL(`tel:${number}`).catch(() => showSnack(number, 'info'));
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: AppColors.backgroundColor }}
      edges={['top']}
    >
      {/* AppBar: back arrow, no title, blends with the screen background */}
      <View style={styles.appBar}>
        <Pressable onPress={() => goBack(router)} hitSlop={8}>
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
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'flex-start' }}>
            {/* Header */}
            <View style={styles.fullRowBetween}>
              <View style={{ flexShrink: 1 }}>
                <BaseText
                  title={`#${formatOrderId(order.order_id)}`}
                  size={sp(18)}
                  fontWeight="bold"
                  color={AppColors.black}
                  numberOfLines={1}
                />
              </View>
              <View style={{ width: w(8) }} />
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusTint(order.status) },
                ]}
              >
                <BaseText
                  title={statusLabel(order.status)}
                  size={sp(12)}
                  fontWeight="600"
                  color={statusColor(order.status)}
                />
              </View>
            </View>
            <View style={{ height: h(4) }} />
            <BaseText
              title={formatDate(order.created_at)}
              size={sp(12)}
              color={AppColors.textColor2}
            />
            <View style={{ height: h(24) }} />

            {/* Stores & Items */}
            <SectionTitle title={t('stores_and_items')} />
            <View style={{ alignSelf: 'stretch' }}>
              <StoreItemBlock
                storeName={order.vendor_name ?? ''}
                items={order.items}
              />
            </View>
            <View style={{ height: h(20) }} />

            {/* Delivery Info — driver name + phone number front and centre, the
                number tappable to dial. */}
            <SectionTitle title={t('delivery_info')} />
            {order.driver ? (
              <>
                <View style={[styles.card, styles.driverCard]}>
                  <AppImage
                    source={order.driver.avatar || ''}
                    width={r(44)}
                    height={r(44)}
                    borderRadius={r(22)}
                    style={styles.avatar}
                  />
                  <View style={{ width: w(12) }} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.fullRowBetween}>
                      <BaseText
                        title={order.driver.name ?? ''}
                        size={sp(14)}
                        fontWeight="bold"
                        color={AppColors.black}
                      />
                      {!!order.driver.rating && (
                        <View style={styles.ratingPill}>
                          <MaterialIcons
                            name="star"
                            size={sp(13)}
                            color={AppColors.startColor}
                          />
                          <View style={{ width: w(4) }} />
                          <BaseText
                            title={order.driver.rating}
                            size={sp(12)}
                            fontWeight="600"
                            color={AppColors.black}
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
                    {!!order.driver.phone && (
                      <Pressable
                        onPress={callDriver}
                        hitSlop={6}
                        style={styles.driverPhoneRow}
                      >
                        <Ionicons
                          name="call"
                          size={sp(14)}
                          color={AppColors.primaryColor}
                        />
                        <View style={{ width: w(6) }} />
                        <BaseText
                          title={order.driver.phone}
                          size={sp(14)}
                          fontWeight="bold"
                          color={AppColors.primaryColor}
                        />
                      </Pressable>
                    )}
                  </View>
                  {!!order.driver.phone && (
                    <Pressable onPress={callDriver} style={styles.callBtn}>
                      <Ionicons name="call" size={sp(16)} color={AppColors.white} />
                    </Pressable>
                  )}
                </View>
                <View style={{ height: h(12) }} />
              </>
            ) : (
              <>
                <View style={[styles.card, styles.cardPad, styles.driverPlaceholder]}>
                  <ActivityIndicator color={AppColors.primaryColor} size="small" />
                  <View style={{ width: w(10) }} />
                  <BaseText
                    title={t('finding_driver')}
                    size={sp(13)}
                    color={AppColors.textColor2}
                  />
                </View>
                <View style={{ height: h(12) }} />
              </>
            )}

            {/* Payment method + delivery preferences */}
            <View style={[styles.card, styles.cardPad]}>
              <View style={styles.paymentRow}>
                <View style={styles.payIcon}>
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={sp(18)}
                    color={AppColors.primaryColor}
                  />
                </View>
                <View style={{ width: w(10) }} />
                <View style={{ flex: 1 }}>
                  <BaseText
                    title={t('cash_on_delivery')}
                    size={sp(14)}
                    fontWeight="bold"
                    color={AppColors.black}
                  />
                  <BaseText
                    title={t('payment_methods_label')}
                    size={sp(12)}
                    color={AppColors.textColor2}
                  />
                </View>
                <MaterialIcons
                  name="check-circle"
                  size={sp(18)}
                  color={AppColors.primaryColor}
                />
              </View>
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
            <View style={{ height: h(20) }} />

            {/* Payment Summary */}
            <SectionTitle title={t('payment_summary')} />
            <View style={[styles.card, styles.cardPad]}>
              <SummaryRow
                title={t('subtotal')}
                value={formatPrice(order.subtotal)}
              />
              <View style={{ height: h(10) }} />
              <SummaryRow
                title={t('delivery_fee')}
                value={formatPrice(order.delivery_fee)}
              />
              {order.discount > 0 ? (
                <>
                  <View style={{ height: h(10) }} />
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
                large
              />
            </View>
            <View style={{ height: h(20) }} />

            {/* Delivery Address */}
            <SectionTitle title={t('delivery_address_label')} />
            <View style={styles.card}>
              {/* Map Preview */}
              <View style={styles.mapWrap}>
                <MapPlaceholder />
              </View>
              <View style={styles.addrRow}>
                <MaterialIcons
                  name="place"
                  size={sp(18)}
                  color={AppColors.primaryColor}
                />
                <View style={{ width: w(8) }} />
                <View style={{ flex: 1 }}>
                  <BaseText
                    title={order.delivery_address ?? ''}
                    size={sp(13)}
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
            </View>
            <View style={{ height: h(28) }} />

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
    backgroundColor: AppColors.backgroundColor,
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
  statusBadge: {
    paddingHorizontal: w(12),
    paddingVertical: h(5),
    borderRadius: r(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h(12),
  },
  sectionAccent: {
    width: r(4),
    height: r(18),
    borderRadius: r(2),
    backgroundColor: AppColors.primaryColor,
  },
  // Shared white "elevated" card used across every section.
  card: {
    alignSelf: 'stretch',
    backgroundColor: AppColors.white,
    borderRadius: r(16),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    shadowColor: AppColors.shadowColor,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  cardPad: {
    padding: w(16),
  },
  cardDivider: {
    height: 1,
    backgroundColor: AppColors.dividerColor,
    marginVertical: h(12),
  },
  storeCard: {
    alignSelf: 'stretch',
    backgroundColor: AppColors.white,
    borderRadius: r(16),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    padding: w(14),
    shadowColor: AppColors.shadowColor,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  storeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeAvatar: {
    width: r(36),
    height: r(36),
    borderRadius: r(18),
    backgroundColor: PRIMARY_TINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: h(8),
  },
  itemRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    backgroundColor: AppColors.lightGreyV2,
  },
  itemDivider: {
    height: 1,
    backgroundColor: AppColors.lightGreyV2,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: w(14),
  },
  driverPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: h(4),
  },
  callBtn: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
    backgroundColor: AppColors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: w(8),
  },
  driverPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: AppColors.lightGreyV2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,178,47,0.15)',
    paddingHorizontal: w(8),
    paddingVertical: h(3),
    borderRadius: r(12),
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payIcon: {
    width: r(36),
    height: r(36),
    borderRadius: r(18),
    backgroundColor: PRIMARY_TINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: h(10),
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.dividerColor,
    marginVertical: h(12),
  },
  mapWrap: {
    height: h(120),
    borderTopLeftRadius: r(16),
    borderTopRightRadius: r(16),
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#DDE7EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinCircle: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.shadowColor,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  comingSoonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    paddingHorizontal: w(10),
    paddingVertical: h(4),
    borderRadius: r(12),
    shadowColor: AppColors.shadowColor,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: w(14),
  },
  primaryButton: {
    alignSelf: 'stretch',
    height: h(52),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primaryColor,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  reportButton: {
    alignSelf: 'stretch',
    height: h(50),
    borderRadius: r(14),
    borderWidth: 1.5,
    borderColor: AppColors.secondMainColor,
    backgroundColor: 'rgba(227,77,56,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
