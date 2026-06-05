// Saved Addresses list. Backed by the local address store (no backend yet).
import React, { useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import { showSnack } from '@/lib/snack';
import { navArgs } from '@/store/navArgs';
import { goBack } from '@/lib/nav';
import { useAddressStore, type Address, type AddressIcon } from '@/features/addresses/addressStore';

const ICONS: Record<AddressIcon, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  work: 'briefcase-outline',
  other: 'location-outline',
};

export default function SavedAddressesScreen() {
  const router = useRouter();
  const addresses = useAddressStore((s) => s.addresses);

  useEffect(() => {
    useAddressStore.getState().hydrate();
  }, []);

  const onEdit = (a: Address) => {
    navArgs.set({ isEdit: true, addressId: a.id });
    router.push('/add-address');
  };

  const onDelete = (a: Address) => {
    Alert.alert(a.title, t('delete_address_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await useAddressStore.getState().removeAddress(a.id);
          showSnack(t('address_deleted'), 'success');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable onPress={() => goBack(router, '/(tabs)/profile')} hitSlop={8} style={styles.leading}>
          <Ionicons name="arrow-back" size={sp(24)} color={AppColors.textColorTheme} />
        </Pressable>
        <BaseText
          title={t('saved_addresses')}
          size={sp(18)}
          fontWeight="bold"
          color={AppColors.textColorTheme}
        />
        <View style={styles.leading} />
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={{ padding: w(16) }}>
        <BaseText
          title={t('saved_addresses')}
          size={sp(15)}
          color={AppColors.textColorTheme}
        />
        <View style={{ height: h(12) }} />

        {addresses.length === 0 ? (
          <View style={styles.empty}>
            <BaseText
              title={t('no_saved_addresses')}
              size={sp(14)}
              color={AppColors.textColor2}
            />
          </View>
        ) : (
          addresses.map((a) => (
            <Pressable
              key={a.id}
              style={styles.card}
              onPress={() => useAddressStore.getState().setDefault(a.id)}
            >
              {a.isDefault && (
                <View style={styles.defaultBadge}>
                  <BaseText
                    title={t('default_label')}
                    size={sp(11)}
                    fontWeight="600"
                    color={AppColors.white}
                  />
                </View>
              )}
              <View style={styles.cardRow}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name={ICONS[a.icon] ?? 'location-outline'}
                    size={sp(20)}
                    color={AppColors.primaryColor}
                  />
                </View>
                <View style={{ width: w(12) }} />
                <View style={{ flex: 1 }}>
                  <BaseText
                    title={a.title}
                    size={sp(16)}
                    fontWeight="bold"
                    color={AppColors.textColorTheme}
                  />
                  <View style={{ height: h(4) }} />
                  <BaseText
                    title={a.details}
                    size={sp(13)}
                    color={AppColors.textColor2}
                  />
                </View>
                <Pressable hitSlop={8} onPress={() => onEdit(a)} style={styles.actionBtn}>
                  <MaterialIcons name="edit" size={sp(18)} color={AppColors.textColor2} />
                </Pressable>
                <Pressable hitSlop={8} onPress={() => onDelete(a)} style={styles.actionBtn}>
                  <MaterialIcons
                    name="delete-outline"
                    size={sp(20)}
                    color={AppColors.textColor2}
                  />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}

        <View style={{ height: h(8) }} />

        {/* Add New Address */}
        <Pressable
          style={styles.addRow}
          onPress={() => {
            navArgs.set({ isEdit: false });
            router.push('/add-address');
          }}
        >
          <MaterialIcons name="add" size={sp(20)} color={AppColors.primaryColor} />
          <View style={{ width: w(6) }} />
          <BaseText
            title={t('add_new_address')}
            size={sp(15)}
            fontWeight="bold"
            color={AppColors.primaryColor}
          />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.backgroundColor },
  appBar: {
    height: h(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(8),
    backgroundColor: AppColors.white,
  },
  leading: { width: w(40), height: w(40), alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(143,169,189,0.3)' },
  empty: { paddingVertical: h(40), alignItems: 'center' },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: r(12),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    padding: w(16),
    marginBottom: h(16),
  },
  defaultBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: AppColors.primaryColor,
    borderTopRightRadius: r(12),
    borderBottomLeftRadius: r(12),
    paddingHorizontal: w(12),
    paddingVertical: h(4),
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: w(40),
    height: w(40),
    borderRadius: w(20),
    backgroundColor: 'rgba(35,90,94,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: { padding: w(6) },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: h(12),
  },
});
