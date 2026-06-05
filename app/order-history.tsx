// Ported from: lib/screens/home/order_history_screen.dart
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, w, h, r, sp } from '@/theme';
import { BaseText } from '@/components';
import { t } from '@/i18n';
import { formatPrice } from '@/lib/currency';
import { navArgs } from '@/store/navArgs';
import { useOrdersStore, type Order } from '@/features/orders/ordersStore';

// In-progress statuses (used for client-side filtering of the "In Progress" tab).
const IN_PROGRESS_STATUSES = ['pending', 'preparing', 'ready', 'on_the_way'];

// Map a backend status value to a display label, falling back to the raw value.
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

function statusColor(status: string): string {
  if (status === 'cancelled') return AppColors.red ?? '#E53935';
  return AppColors.primaryColor;
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

export default function OrderHistoryScreen() {
  const router = useRouter();

  const orders = useOrdersStore((s) => s.orders);
  const totalOrders = useOrdersStore((s) => s.totalOrders);
  const isLoading = useOrdersStore((s) => s.isLoading);

  const [selectedFilter, setSelectedFilter] = useState<string>('All Orders');
  const filters: string[] = [
    'All Orders',
    'Delivered',
    'In Progress',
    'Cancelled',
  ];

  // Initial load.
  useEffect(() => {
    useOrdersStore.getState().loadOrders();
  }, []);

  const onSelectFilter = (filter: string) => {
    setSelectedFilter(filter);
    const load = useOrdersStore.getState().loadOrders;
    if (filter === 'Delivered') load('delivered');
    else if (filter === 'Cancelled') load('cancelled');
    else load(); // 'All Orders' & 'In Progress' both load all, the latter filters client-side
  };

  // The "In Progress" tab is filtered client-side across multiple statuses.
  const visibleOrders = useMemo(() => {
    if (selectedFilter === 'In Progress') {
      return orders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status));
    }
    return orders;
  }, [orders, selectedFilter]);

  const currentMonth = new Date().toLocaleString('en', { month: 'long' });

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
    >
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.appBarLeading}
        >
          <Ionicons name="arrow-back" size={r(24)} color={AppColors.black} />
        </Pressable>
        <View style={styles.appBarTitleWrap}>
          <BaseText
            title={t('orders_history')}
            color={AppColors.black}
            size={sp(18)}
            fontWeight="bold"
            textAlign="center"
          />
        </View>
        <Pressable
          onPress={() => {
            // Open filter modal
          }}
          hitSlop={8}
          style={styles.appBarAction}
        >
          <MaterialIcons
            name="filter-list"
            size={r(24)}
            color={AppColors.black}
          />
        </Pressable>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Stats Card */}
        <View style={styles.statsPadding}>
          <View style={styles.statsCard}>
            <MaterialIcons
              name="show-chart"
              size={r(24)}
              color={AppColors.primaryColor}
            />
            <View style={{ width: w(12) }} />
            <BaseText
              title={t('you_placed_orders_in', {
                count: totalOrders,
                month: currentMonth,
              })}
              color={AppColors.textColor2}
              size={sp(14)}
            />
          </View>
        </View>

        {/* Filters Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => onSelectFilter(filter)}
                style={styles.filterItemWrap}
              >
                <View
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected
                        ? AppColors.primaryColor
                        : AppColors.baserColor,
                    },
                  ]}
                >
                  <BaseText
                    title={filter}
                    color={isSelected ? AppColors.white : AppColors.textColorTheme}
                    size={sp(14)}
                    fontWeight="500"
                  />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Date/Sort Row */}
        <View style={styles.dateSortPadding}>
          <View style={styles.dateSortRow}>
            <View style={styles.dropdownBox}>
              <View style={styles.rowBetween}>
                <BaseText
                  title={t('date_range')}
                  size={sp(14)}
                  color={AppColors.textColorTheme}
                />
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={sp(18)}
                  color={AppColors.textColorTheme}
                />
              </View>
            </View>
            <View style={{ width: w(16) }} />
            <View style={styles.dropdownBox}>
              <View style={styles.rowBetween}>
                <BaseText
                  title={`${t('sort_by')}: ${t('recent')}`}
                  size={sp(14)}
                  color={AppColors.textColorTheme}
                />
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={sp(18)}
                  color={AppColors.textColorTheme}
                />
              </View>
            </View>
          </View>
        </View>

        {/* List */}
        {isLoading && orders.length === 0 ? (
          <View style={styles.centerFill}>
            <ActivityIndicator color={AppColors.primaryColor} />
          </View>
        ) : visibleOrders.length === 0 ? (
          <View style={styles.centerFill}>
            <BaseText
              title={t('no_orders')}
              size={sp(14)}
              color={AppColors.textColor2}
              textAlign="center"
            />
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            data={visibleOrders}
            keyExtractor={(order) => order.order_id}
            renderItem={({ item: order }: { item: Order }) => {
              const isDelivered = order.status === 'delivered';
              const isCancelled = order.status === 'cancelled';
              const canTrack = !isDelivered && !isCancelled;

              const openDetails = () => {
                navArgs.set({ orderId: order.order_id });
                router.push('/order-details');
              };

              return (
                <View style={styles.orderCardWrap}>
                  <Pressable style={styles.orderCard} onPress={openDetails}>
                    {/* Header */}
                    <View style={styles.rowBetween}>
                      <BaseText
                        title={`#${order.order_id}`}
                        size={sp(14)}
                        fontWeight="bold"
                        color={AppColors.black}
                      />
                      <BaseText
                        title={statusLabel(order.status)}
                        size={sp(14)}
                        fontWeight="500"
                        color={statusColor(order.status)}
                      />
                    </View>
                    <View style={{ height: h(4) }} />
                    <BaseText
                      title={formatDate(order.created_at)}
                      size={sp(12)}
                      color={AppColors.textColor2}
                    />
                    <View style={{ height: h(12) }} />
                    {/* Titles */}
                    <BaseText
                      title={order.vendor_name ?? ''}
                      size={sp(16)}
                      color={AppColors.textColorTheme}
                    />
                    <View style={{ height: h(4) }} />
                    <BaseText
                      title={`${order.items.length} ${t('items')}`}
                      size={sp(12)}
                      color={AppColors.textColor2}
                    />
                    <View style={{ height: h(16) }} />
                    {/* Footer */}
                    <View style={styles.rowBetween}>
                      <BaseText
                        title={formatPrice(order.total)}
                        size={sp(16)}
                        fontWeight="bold"
                        color={AppColors.black}
                      />
                      <Pressable
                        onPress={() => {
                          if (canTrack) {
                            navArgs.set({ orderId: order.order_id });
                            router.push('/tracking-order');
                          } else {
                            openDetails();
                          }
                        }}
                        style={styles.cardButton}
                      >
                        <BaseText
                          title={canTrack ? t('track_your_order') : t('view_details')}
                          size={sp(12)}
                          fontWeight="600"
                          color={AppColors.white}
                        />
                      </Pressable>
                    </View>
                  </Pressable>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  appBar: {
    height: h(56),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    paddingHorizontal: w(4),
  },
  appBarLeading: { padding: w(8) },
  appBarTitleWrap: { flex: 1, alignItems: 'center' },
  appBarAction: { padding: w(8) },
  body: { flex: 1 },
  statsPadding: {
    paddingHorizontal: w(16),
    paddingVertical: h(8),
  },
  statsCard: {
    padding: w(16),
    backgroundColor: AppColors.baserColor, // Light grey background
    borderRadius: r(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtersContent: {
    paddingHorizontal: w(16),
    paddingVertical: h(8),
    flexDirection: 'row',
  },
  filterItemWrap: {
    paddingRight: w(8),
  },
  filterChip: {
    paddingHorizontal: w(16),
    paddingVertical: h(8),
    borderRadius: r(20),
  },
  dateSortPadding: {
    paddingHorizontal: w(16),
    paddingVertical: h(8),
  },
  dateSortRow: {
    flexDirection: 'row',
  },
  dropdownBox: {
    flex: 1,
    paddingHorizontal: w(12),
    paddingVertical: h(10),
    backgroundColor: AppColors.baserColor,
    borderRadius: r(8),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: w(16),
  },
  listContent: {
    padding: w(16),
  },
  orderCardWrap: {
    marginBottom: h(16),
  },
  orderCard: {
    padding: w(16),
    backgroundColor: AppColors.white,
    borderRadius: r(12),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
  },
  cardButton: {
    height: h(36),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(8),
    paddingHorizontal: w(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
