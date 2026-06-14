// Lightweight shimmer/skeleton placeholders shown while the home & orders
// screens load — a pulsing-opacity animation (no gradient dependency, runs on
// the native driver). Shapes mirror RestaurantRowCard and the order-history card.
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import { AppColors, w, h, r } from '@/theme';

/** One shimmering placeholder block. */
export function Skeleton({
  width = '100%',
  height = h(12),
  radius = r(6),
  style,
}: {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: AppColors.shimmerColor, opacity }, style]}
    />
  );
}

/** Skeleton matching one RestaurantRowCard (square image + 3 text lines). */
export function RestaurantRowSkeleton() {
  return (
    <View style={styles.restRow}>
      <Skeleton width={w(92)} height={w(92)} radius={r(12)} />
      <View style={styles.restBody}>
        <Skeleton width="68%" height={h(15)} />
        <Skeleton width="42%" height={h(12)} style={{ marginTop: h(9) }} />
        <Skeleton width="55%" height={h(11)} style={{ marginTop: h(10) }} />
      </View>
    </View>
  );
}

/** A vertical list of restaurant-row skeletons (home loading). */
export function RestaurantListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantRowSkeleton key={i} />
      ))}
    </View>
  );
}

/** A horizontal row of category-chip skeletons (home loading). */
export function CategoryRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: count }).map((_, i) => (
        // Matches CategoryCard: a 65×65 r(16) tile + an h(8) gap to its label.
        <View key={i} style={{ marginRight: w(16), alignItems: 'center' }}>
          <Skeleton width={w(65)} height={w(65)} radius={r(16)} />
          <Skeleton width={w(50)} height={h(10)} style={{ marginTop: h(8) }} />
        </View>
      ))}
    </View>
  );
}

/** Skeleton matching one order-history card: header (#id · status), date, two
 *  item lines, then the total row — same stacking/gaps as the real card. */
export function OrderCardSkeleton() {
  return (
    <View style={styles.orderCard}>
      <View style={styles.between}>
        <Skeleton width={w(96)} height={h(15)} />
        <Skeleton width={w(64)} height={h(14)} />
      </View>
      <Skeleton width={w(130)} height={h(11)} style={{ marginTop: h(6) }} />
      <Skeleton width="78%" height={h(13)} style={{ marginTop: h(14) }} />
      <Skeleton width="48%" height={h(11)} style={{ marginTop: h(6) }} />
      <View style={[styles.between, { marginTop: h(16) }]}>
        <Skeleton width={w(80)} height={h(16)} />
        <Skeleton width={w(70)} height={h(14)} />
      </View>
    </View>
  );
}

/** A vertical list of order-card skeletons (orders loading). */
export function OrderListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.orderList}>
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  restRow: {
    flexDirection: 'row',
    padding: w(10),
    borderRadius: r(14),
    marginBottom: h(14),
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
  },
  restBody: { flex: 1, paddingLeft: w(12), justifyContent: 'center' },
  orderList: { paddingHorizontal: w(16), paddingTop: h(8) },
  orderCard: {
    padding: w(16),
    marginBottom: h(16),
    backgroundColor: AppColors.white,
    borderRadius: r(12),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
  },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});

export default Skeleton;
