// Ported from: lib/screens/home/order_history_screen.dart
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, w, h, r, sp } from '@/theme';
import { BaseText } from '@/components';
import { t } from '@/i18n';
import { useI18n } from '@/i18n';
// Feature store (per task) — imported & available even though this screen uses mock data.
import { useHomeStore } from '@/features/home/homeStore';

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { lang } = useI18n();

  // Imported feature store available (mirrors Flutter screen wiring).
  void useHomeStore;

  const [selectedFilter, setSelectedFilter] = useState<string>('All Orders');
  const filters: string[] = [
    'All Orders',
    'Delivered',
    'In Progress',
    'Cancelled',
  ];

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
            // Using orders_history existing key
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
                count: '12',
                month: 'August',
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
            // Mapping filter name to key if needed, or just display text for mock
            let displayText = filter;
            if (filter === 'All Orders') displayText = t('orders'); // Mock
            if (filter === 'Delivered') displayText = t('delivered');
            if (filter === 'In Progress') displayText = t('pending'); // or custom
            if (filter === 'Cancelled') displayText = t('cancelled');

            // Override for English display to match design if keys miss
            if (lang === 'en') {
              // Keep original strings for English consistency with design
              displayText = filter;
            }

            return (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
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
                    title={displayText}
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
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          data={[0, 1, 2, 3]}
          keyExtractor={(item) => String(item)}
          renderItem={({ index }) => {
            // Mock Logic for status
            const statusKey = 'delivered';
            const statusColor = AppColors.primaryColor;
            let isDelivered = true;

            if (index === 1) {
              // Make second item "In Progress" to show Track button logic
              // But user design shows all "Delivered" in the list?
              // No, design shows "Delivered" on all cards BUT second card has "Track Order".
              // Maybe it's active.
              // I'll simulate index 1 as active.
              // statusKey = "In Progress";
              // But design text says "Delivered" on that card too!
              // This implies "Delivered" but "Track Order" button? Maybe "Track recent delivery"?
              // Or maybe it's just a mock inconsistency.
              // I'll stick to: If index 1, show "Track Order" button.
              isDelivered = false; // logic flag for button
            }

            return (
              <View style={styles.orderCardWrap}>
                <View style={styles.orderCard}>
                  {/* Header */}
                  <View style={styles.rowBetween}>
                    <BaseText
                      title="#JWL-2025-0098"
                      size={sp(14)}
                      fontWeight="bold"
                      color={AppColors.black}
                    />
                    <BaseText
                      title={t(statusKey)}
                      size={sp(14)}
                      fontWeight="500"
                      color={statusColor}
                    />
                  </View>
                  <View style={{ height: h(4) }} />
                  <BaseText
                    title="Aug 10, 2025 - 7:45 PM"
                    size={sp(12)}
                    color={AppColors.textColor2}
                  />
                  <View style={{ height: h(12) }} />
                  {/* Titles */}
                  <BaseText
                    title="Nova Sweets, Burger House"
                    size={sp(16)}
                    color={AppColors.textColorTheme}
                  />
                  <View style={{ height: h(16) }} />
                  {/* Footer */}
                  <View style={styles.rowBetween}>
                    <BaseText
                      title={`78.50 ${t('aed')}`}
                      size={sp(16)}
                      fontWeight="bold"
                      color={AppColors.black}
                    />
                    <Pressable
                      onPress={() => {
                        if (!isDelivered) {
                          router.push('/tracking-order');
                        } else {
                          // View Details
                        }
                      }}
                      style={styles.cardButton}
                    >
                      <BaseText
                        title={!isDelivered ? t('track_your_order') : t('view_details')}
                        size={sp(12)}
                        fontWeight="600"
                        color={AppColors.white}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          }}
        />
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
