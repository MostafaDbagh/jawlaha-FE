// Restaurant list row (Keeta-style): square image + name, cuisine, delivery
// meta line, and offer/free-delivery badges.
import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { BaseText } from '@/components';

export interface RestaurantBadge {
  text: string;
  /** 'offer' = yellow pill, 'free' = green pill */
  type: 'offer' | 'free';
}

export interface RestaurantRowCardProps {
  name: string;
  image?: string;
  cuisine?: string;
  deliveryTime?: string;
  distanceKm?: number;
  freeDelivery?: boolean;
  badges?: RestaurantBadge[];
  onPress?: () => void;
}

export function RestaurantRowCard({
  name,
  image,
  cuisine,
  deliveryTime,
  distanceKm,
  freeDelivery,
  badges = [],
  onPress,
}: RestaurantRowCardProps) {
  const [imgError, setImgError] = useState(false);

  const meta: string[] = [];
  if (deliveryTime) meta.push(deliveryTime);
  if (distanceKm != null) meta.push(`${distanceKm.toFixed(1)} km`);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageBox}>
        {image && !imgError ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            contentFit="cover"
            transition={0}
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <MaterialIcons name="restaurant" color={AppColors.hintColor} size={sp(28)} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <BaseText title={name} numberOfLines={1} style={styles.name} />
        {!!cuisine && (
          <BaseText title={cuisine} numberOfLines={1} style={styles.cuisine} />
        )}

        <View style={styles.metaRow}>
          <MaterialIcons name="pedal-bike" size={sp(14)} color={AppColors.green} />
          <View style={{ width: w(4) }} />
          {freeDelivery && (
            <BaseText title="Free" style={styles.free} />
          )}
          {meta.length > 0 && (
            <BaseText
              title={`${freeDelivery ? ' · ' : ''}${meta.join(' · ')}`}
              style={styles.meta}
            />
          )}
        </View>

        {badges.length > 0 && (
          <View style={styles.badgesRow}>
            {badges.map((b, i) => (
              <View
                key={`${b.text}-${i}`}
                style={[styles.badge, b.type === 'free' ? styles.badgeFree : styles.badgeOffer]}
              >
                <BaseText
                  title={b.text}
                  style={[styles.badgeText, b.type === 'free' ? styles.badgeFreeText : styles.badgeOfferText]}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: AppColors.white,
    borderRadius: r(14),
    padding: w(10),
    marginBottom: h(14),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
  },
  pressed: { opacity: 0.9 },
  imageBox: {
    width: w(92),
    height: w(92),
    borderRadius: r(12),
    overflow: 'hidden',
    backgroundColor: AppColors.lightGreyV2,
  },
  image: { width: '100%', height: '100%' },
  imageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, paddingLeft: w(12), justifyContent: 'center' },
  name: { fontSize: sp(16), fontWeight: '700', color: AppColors.textColorTheme },
  cuisine: { fontSize: sp(13), color: AppColors.greyTextColorV3, marginTop: h(2) },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: h(6) },
  free: { fontSize: sp(12), color: AppColors.green, fontWeight: '700' },
  meta: { fontSize: sp(12), color: AppColors.greyTextColorV3 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: w(6), marginTop: h(8) },
  badge: { paddingHorizontal: w(8), paddingVertical: h(3), borderRadius: r(6) },
  badgeOffer: { backgroundColor: '#FBE9A8' },
  badgeFree: { backgroundColor: 'rgba(22,167,121,0.15)' },
  badgeText: { fontSize: sp(11), fontWeight: '600' },
  badgeOfferText: { color: '#8A6D00' },
  badgeFreeText: { color: AppColors.green },
});

export default RestaurantRowCard;
