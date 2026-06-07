// Address & Delivery (checkout step 1). Layout per the Jawla Figma; teal theme.
// Saved addresses come from the local address store; the order summary is wired
// to the real cart subtotal.
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, TextInput, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { AppColors, w, h, r, sp } from '@/theme';
import { QuicksandFamily } from '@/theme/typography';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import { showSnack } from '@/lib/snack';
import { formatPrice } from '@/lib/currency';
import { computeTotals } from '@/lib/fees';
import { navArgs } from '@/store/navArgs';
import { goBack } from '@/lib/nav';
import { useCartStore } from '@/features/cart/cartStore';
import { useAddressStore, type AddressIcon } from '@/features/addresses/addressStore';

const ADDR_ICONS: Record<AddressIcon, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  work: 'briefcase-outline',
  other: 'location-outline',
};

const SCHEDULE_TIMES = ['10:00am', '10:30am', '11:00am', '11:30am', '12:00pm'];

export default function CheckoutAddressScreen() {
  const router = useRouter();

  const addresses = useAddressStore((s) => s.addresses);
  const selectedId = useAddressStore((s) => s.selectedId);
  const subtotal = useCartStore((s) => s.summary.subtotal);

  const [deliverNow, setDeliverNow] = useState(true);
  const [scheduleTime, setScheduleTime] = useState(SCHEDULE_TIMES[0]);
  const [timeOpen, setTimeOpen] = useState(false);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    useAddressStore.getState().hydrate();
  }, []);

  const totals = computeTotals(subtotal);
  const selected = addresses.find((a) => a.id === selectedId);

  const onProceed = () => {
    if (!selected) {
      showSnack(t('add_address_first'), 'info');
      router.push('/saved-addresses');
      return;
    }
    navArgs.set({
      ...navArgs.get(),
      delivery_address: selected.details,
      delivery_note: instructions.trim() || undefined,
      // Carried to the payment page so the user double-checks the delivery
      // location (Home/Office) before the order is placed.
      delivery_type: selected.title,
      delivery_icon: selected.icon,
    });
    router.push('/checkout-payment');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable onPress={() => goBack(router, '/(tabs)/cart')} hitSlop={8} style={styles.leading}>
          <Ionicons name="arrow-back" size={sp(24)} color={AppColors.textColorTheme} />
        </Pressable>
        <BaseText
          title={t('address_delivery_title')}
          size={sp(18)}
          fontWeight="bold"
          color={AppColors.textColorTheme}
        />
        <View style={styles.leading} />
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={{ padding: w(16), paddingBottom: h(24) }}>
        {/* Saved Addresses */}
        <BaseText title={t('saved_addresses')} size={sp(16)} fontWeight="bold" color={AppColors.textColorTheme} />
        <View style={{ height: h(12) }} />

        {addresses.length === 0 ? (
          <View style={styles.emptyAddr}>
            <BaseText title={t('no_saved_addresses')} size={sp(14)} color={AppColors.textColor2} />
          </View>
        ) : (
          addresses.map((a) => {
            const isSel = a.id === selectedId;
            return (
              <Pressable
                key={a.id}
                onPress={() => useAddressStore.getState().select(a.id)}
                style={[styles.addrCard, isSel && styles.addrCardSelected]}
              >
                <Ionicons
                  name={ADDR_ICONS[a.icon] ?? 'location-outline'}
                  size={sp(20)}
                  color={isSel ? AppColors.primaryColor : AppColors.textColor2}
                />
                <View style={{ width: w(12) }} />
                <View style={{ flex: 1 }}>
                  <BaseText title={a.title} size={sp(16)} fontWeight="bold" color={AppColors.textColorTheme} />
                  <View style={{ height: h(2) }} />
                  <BaseText title={a.details} size={sp(13)} color={AppColors.textColor2} />
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={() => {
                    navArgs.set({ isEdit: true, addressId: a.id });
                    router.push('/add-address');
                  }}
                  style={styles.cardAction}
                >
                  <MaterialIcons name="edit" size={sp(18)} color={AppColors.textColor2} />
                </Pressable>
              </Pressable>
            );
          })
        )}

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
          <BaseText title={t('add_new_address')} size={sp(15)} fontWeight="bold" color={AppColors.primaryColor} />
        </Pressable>

        <View style={{ height: h(20) }} />

        {/* Delivery Time */}
        <BaseText title={t('delivery_time_label')} size={sp(16)} fontWeight="bold" color={AppColors.textColorTheme} />
        <View style={{ height: h(12) }} />
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setDeliverNow(true)}
            style={[styles.toggleBtn, deliverNow ? styles.toggleOn : styles.toggleOff]}
          >
            <BaseText
              title={t('deliver_now')}
              size={sp(14)}
              fontWeight="bold"
              color={deliverNow ? AppColors.white : AppColors.textColorTheme}
            />
          </Pressable>
          <View style={{ width: w(12) }} />
          <Pressable
            onPress={() => setDeliverNow(false)}
            style={[styles.toggleBtn, !deliverNow ? styles.toggleOn : styles.toggleOff]}
          >
            <BaseText
              title={t('schedule_delivery')}
              size={sp(14)}
              fontWeight="bold"
              color={!deliverNow ? AppColors.white : AppColors.textColorTheme}
            />
          </Pressable>
        </View>

        {!deliverNow && (
          <>
            <View style={{ height: h(12) }} />
            <Pressable style={styles.timeSelect} onPress={() => setTimeOpen(true)}>
              <MaterialIcons name="access-time" size={sp(18)} color={AppColors.primaryColor} />
              <View style={{ width: w(8) }} />
              <BaseText title={scheduleTime} size={sp(14)} color={AppColors.textColorTheme} fontWeight="500" />
              <View style={{ flex: 1 }} />
              <MaterialIcons name="keyboard-arrow-down" size={sp(20)} color={AppColors.textColorTheme} />
            </Pressable>
          </>
        )}

        <View style={{ height: h(20) }} />

        {/* Delivery Instructions */}
        <View style={{ flexDirection: 'row' }}>
          <BaseText title={t('delivery_instructions')} size={sp(16)} fontWeight="bold" color={AppColors.textColorTheme} />
          <View style={{ width: w(4) }} />
          <BaseText title={t('optional_label')} size={sp(16)} color={AppColors.textColor2} />
        </View>
        <View style={{ height: h(8) }} />
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          multiline
          maxLength={100}
          placeholder={t('leave_at_door_placeholder')}
          placeholderTextColor={AppColors.textColor2}
          style={styles.instructions}
          textAlignVertical="top"
        />
        <View style={{ alignSelf: 'flex-end', marginTop: h(4) }}>
          <BaseText title={`${instructions.length}/100`} size={sp(12)} color={AppColors.textColor2} />
        </View>

        <View style={{ height: h(20) }} />
        <View style={styles.divider} />
        <View style={{ height: h(16) }} />

        {/* Order Summary */}
        <BaseText title={t('order_summary')} size={sp(16)} fontWeight="bold" color={AppColors.textColorTheme} />
        <View style={{ height: h(12) }} />
        <SummaryRow label={t('subtotal')} value={formatPrice(totals.subtotal)} />
        <View style={{ height: h(10) }} />
        <SummaryRow label={t('delivery_fee')} value={formatPrice(totals.deliveryFee)} />
        <View style={{ height: h(12) }} />
        <View style={styles.divider} />
        <View style={{ height: h(12) }} />
        <SummaryRow label={t('total')} value={formatPrice(totals.total)} bold />
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.bottomBar}>
        <Pressable onPress={onProceed} style={styles.proceedBtn}>
          <BaseText title={t('proceed_payment')} size={sp(16)} fontWeight="bold" color={AppColors.white} />
        </Pressable>
      </View>

      {/* Schedule time picker */}
      <Modal visible={timeOpen} transparent animationType="fade" onRequestClose={() => setTimeOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setTimeOpen(false)}>
          <View style={styles.modalMenu}>
            {SCHEDULE_TIMES.map((time) => (
              <Pressable
                key={time}
                style={styles.modalItem}
                onPress={() => {
                  setScheduleTime(time);
                  setTimeOpen(false);
                }}
              >
                <BaseText
                  title={time}
                  size={sp(15)}
                  color={time === scheduleTime ? AppColors.primaryColor : AppColors.textColorTheme}
                  fontWeight={time === scheduleTime ? 'bold' : 'normal'}
                />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <BaseText
        title={label}
        size={bold ? sp(16) : sp(14)}
        fontWeight={bold ? 'bold' : 'normal'}
        color={bold ? AppColors.textColorTheme : AppColors.textColor2}
      />
      <BaseText
        title={value}
        size={bold ? sp(16) : sp(14)}
        fontWeight={bold ? 'bold' : '600'}
        color={bold ? AppColors.primaryColor : AppColors.textColorTheme}
      />
    </View>
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
  emptyAddr: { paddingVertical: h(24), alignItems: 'center' },
  addrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: w(14),
    borderRadius: r(12),
    borderWidth: 1.5,
    borderColor: AppColors.lightGreyV2,
    backgroundColor: AppColors.white,
    marginBottom: h(10),
  },
  addrCardSelected: {
    borderColor: AppColors.primaryColor,
    backgroundColor: 'rgba(35,90,94,0.06)',
  },
  cardAction: { padding: w(6) },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: h(10),
  },
  toggleRow: { flexDirection: 'row' },
  toggleBtn: {
    flex: 1,
    height: h(48),
    borderRadius: r(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  toggleOn: { backgroundColor: AppColors.primaryColor, borderColor: AppColors.primaryColor },
  toggleOff: { backgroundColor: AppColors.white, borderColor: AppColors.lightGreyV2 },
  timeSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(12),
    height: h(48),
    borderRadius: r(10),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    backgroundColor: AppColors.white,
  },
  instructions: {
    minHeight: h(90),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(10),
    padding: w(12),
    fontSize: sp(14),
    fontFamily: QuicksandFamily.regular,
    color: AppColors.textColorTheme,
    backgroundColor: AppColors.white,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottomBar: {
    padding: w(16),
    backgroundColor: AppColors.white,
    shadowColor: AppColors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  proceedBtn: {
    width: '100%',
    height: h(52),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    paddingHorizontal: w(40),
  },
  modalMenu: { backgroundColor: AppColors.white, borderRadius: r(12), paddingVertical: h(8) },
  modalItem: { paddingHorizontal: w(20), paddingVertical: h(14) },
});
