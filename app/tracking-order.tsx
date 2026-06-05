// Ported from lib/screens/cart/tracking_order_screen.dart (TrackingOrderScreen)
import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText } from '@/components';

// NOTE: google_maps_flutter map -> simple RN placeholder per migration conventions.
// const _initialCameraPosition = { target: { lat: 25.2048, lng: 55.2708 }, zoom: 13 }; // Dubai

interface Step {
  title: string;
  subtitle: string;
  isCompleted: boolean;
  isActive: boolean;
}

const _steps: Step[] = [
  { title: 'nova', subtitle: 'picked_up', isCompleted: true, isActive: false },
  {
    title: 'Burger shop',
    subtitle: 'preparing',
    isCompleted: true,
    isActive: false,
  },
  {
    title: 'Burger shop',
    subtitle: 'ready_to_pick_up',
    isCompleted: true,
    isActive: false,
  },
  {
    title: 'On its way',
    subtitle: 'waiting_to_complete',
    isCompleted: false,
    isActive: true,
  },
  {
    title: 'Delivered',
    subtitle: 'waiting_to_complete',
    isCompleted: false,
    isActive: false,
  },
];

function TimelineStep({
  title,
  subtitle,
  isCompleted,
  isActive,
  isLast,
}: {
  title: string;
  subtitle: string;
  isCompleted: boolean;
  isActive: boolean;
  isLast: boolean;
}) {
  const nodeColor = isCompleted
    ? AppColors.primaryColor
    : isActive
      ? AppColors.primaryColor
      : AppColors.lightGreyV2;
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
          title={t(title)}
          style={{
            fontSize: sp(16),
            fontWeight: '600',
            color:
              isActive || isCompleted
                ? AppColors.primaryColor
                : AppColors.textColorTheme,
          }}
        />
        <BaseText
          title={t(subtitle)}
          style={{ fontSize: sp(12), color: AppColors.textColor2 }}
        />
        {!isLast && <View style={{ height: h(24) }} />}
      </View>
    </View>
  );
}

export default function TrackingOrderScreen() {
  const router = useRouter();
  const screenHeight = Dimensions.get('window').height;

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
              fontWeight: 'bold',
            }}
          />
          <View style={{ width: r(24) }} />
        </View>

        {/* Draggable Details Sheet (fixed-height fallback) */}
        <View style={[styles.sheet, { height: screenHeight * 0.6 }]}>
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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <BaseText
                title={`18 ${t('mins_until_delivery')}`}
                style={{
                  fontSize: sp(18),
                  fontWeight: 'bold',
                  color: AppColors.black,
                }}
              />
              <BaseText
                title={`2:45 ${t('pm').toUpperCase()}`}
                style={{ fontSize: sp(14), color: AppColors.textColor2 }}
              />
            </View>
            <View style={{ height: h(24) }} />

            {/* Timeline */}
            {_steps.map((step, index) => (
              <TimelineStep
                key={index}
                title={step.title}
                subtitle={step.subtitle}
                isCompleted={step.isCompleted}
                isActive={step.isActive}
                isLast={index === _steps.length - 1}
              />
            ))}

            <View style={{ alignItems: 'center', paddingVertical: h(16) }}>
              <BaseText
                title={`${t('heading_to')} Spinneys (Stop 2 of 4)`}
                style={{
                  color: AppColors.primaryColor,
                  fontSize: sp(14),
                  fontWeight: '500',
                }}
              />
            </View>

            <View style={styles.divider} />
            <View style={{ height: h(16) }} />

            {/* Driver Card */}
            <View style={styles.driverCard}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
                style={styles.avatar}
              />
              <View style={{ width: w(12) }} />
              <View style={{ alignItems: 'flex-start' }}>
                <BaseText
                  title="Ahmed"
                  style={{
                    fontWeight: 'bold',
                    fontSize: sp(16),
                    color: AppColors.black,
                  }}
                />
                <View style={{ height: h(4) }} />
                <BaseText
                  title="Toyota Yaris • White"
                  style={{ fontSize: sp(12), color: AppColors.textColor2 }}
                />
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="star" size={sp(16)} color="orange" />
                  <BaseText
                    title="4.8"
                    style={{
                      fontWeight: 'bold',
                      fontSize: sp(14),
                      color: AppColors.black,
                    }}
                  />
                </View>
                <View style={{ height: h(8) }} />
                <Pressable
                  onPress={() => {}}
                  style={styles.callButton}
                >
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

            <View style={{ height: h(24) }} />
            <BaseText
              title={t('order_summary')}
              style={{
                fontSize: sp(16),
                fontWeight: 'bold',
                color: AppColors.black,
              }}
            />
            <View style={{ height: h(12) }} />

            {/* Summary Item */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: 'https://via.placeholder.com/150' }}
                style={styles.summaryImage}
              />
              <View style={{ width: w(12) }} />
              <View style={{ flex: 1, alignItems: 'flex-start' }}>
                <BaseText
                  title="Fresh Market"
                  style={{
                    fontWeight: 'bold',
                    fontSize: sp(14),
                    color: AppColors.black,
                  }}
                />
                <BaseText
                  title="1 x Organic Avocado"
                  style={{ fontSize: sp(12), color: AppColors.textColor2 }}
                />
              </View>
              <BaseText
                title={`32.00 ${t('aed')}`}
                style={{
                  fontWeight: 'bold',
                  fontSize: sp(14),
                  color: AppColors.black,
                }}
              />
            </View>
            <View style={{ height: h(30) }} />
          </ScrollView>
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
    width: r(48),
    height: r(48),
    borderRadius: r(24),
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
    width: w(50),
    height: w(50),
    borderRadius: r(8),
    backgroundColor: AppColors.lightGreyV2,
  },
});
