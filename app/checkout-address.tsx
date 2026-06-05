// Ported from: lib/screens/cart/checkout_address_screen.dart
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import { navArgs, useNavArgs } from '@/store/navArgs';

// NOTE: Flutter used google_maps_flutter GoogleMap for the address preview.
// Per migration conventions, render a simple map placeholder fallback.
// final CameraPosition _initialPosition = const CameraPosition(
//   target: LatLng(25.1972, 55.2744), // Dubai Downtown
//   zoom: 14.4746,
// );
const _initialPosition = {
  target: { latitude: 25.1972, longitude: 55.2744 }, // Dubai Downtown
  zoom: 14.4746,
};

function MapPlaceholder() {
  return (
    <View style={styles.mapPlaceholder}>
      <MaterialIcons
        name="location-pin"
        size={sp(24)}
        color={AppColors.primaryColorTheme}
      />
    </View>
  );
}

interface DropdownItem {
  value: string;
  label: string;
}

function CheckoutDropdown({
  value,
  items,
  onChanged,
  iconName,
  iconIsHourglass = false,
  hint,
}: {
  value: string;
  items: DropdownItem[];
  onChanged: (val: string) => void;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconIsHourglass?: boolean;
  hint: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.value === value);
  const leadingIcon = iconIsHourglass ? 'hourglass-empty' : iconName;

  return (
    <View>
      <Pressable style={styles.dropdown} onPress={() => setOpen(true)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {selected ? (
            <>
              <MaterialIcons
                name={leadingIcon}
                size={sp(18)}
                color={AppColors.errorColor}
              />
              <View style={{ width: w(8) }} />
              <BaseText
                title={selected.label}
                size={sp(14)}
                color={AppColors.textColorTheme}
                fontWeight="500"
              />
            </>
          ) : (
            <>
              <MaterialIcons
                name={leadingIcon}
                size={sp(18)}
                color={AppColors.errorColor}
              />
              <View style={{ width: w(8) }} />
              <BaseText
                title={hint}
                size={sp(14)}
                color={AppColors.textColorTheme}
              />
            </>
          )}
        </View>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={sp(20)}
          color={AppColors.textColorTheme}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.modalMenu}>
            {items.map((item) => (
              <Pressable
                key={item.value}
                style={styles.modalItem}
                onPress={() => {
                  onChanged(item.value);
                  setOpen(false);
                }}
              >
                <MaterialIcons
                  name={leadingIcon}
                  size={sp(18)}
                  color={AppColors.errorColor}
                />
                <View style={{ width: w(8) }} />
                <BaseText
                  title={item.label}
                  size={sp(14)}
                  color={AppColors.textColorTheme}
                  fontWeight="500"
                />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function CheckoutAddressScreen() {
  const router = useRouter();

  const savedArgs = useNavArgs((s) => s.args);
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedTime, setSelectedTime] = useState('asap');
  const [address, setAddress] = useState(
    (savedArgs?.delivery_address as string) ?? 'Damascus, Syria',
  );
  const [instructions, setInstructions] = useState('');

  void _initialPosition;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: AppColors.backgroundColor }}
      edges={['top']}
    >
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.appBarLeading}
        >
          <Ionicons
            name="arrow-back"
            size={sp(24)}
            color={AppColors.textColorTheme}
          />
        </Pressable>
        <BaseText
          title={t('address_delivery_title')}
          size={sp(18)}
          fontWeight="bold"
          color={AppColors.textColorTheme}
        />
        <View style={styles.appBarLeading} />
      </View>
      <View style={styles.appBarDivider} />

      <ScrollView contentContainerStyle={{ padding: w(16) }}>
        {/* Saved Addresses Header */}
        <BaseText
          title={t('saved_addresses')}
          size={sp(14)}
          color={AppColors.textColor2}
        />
        <View style={{ height: h(12) }} />

        {/* Delivery Address Card */}
        <View style={styles.addressCard}>
          <BaseText
            title={t('delivery_address_label')}
            size={sp(14)}
            fontWeight="bold"
            color={AppColors.textColor2}
          />
          <View style={{ height: h(12) }} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Map Placeholder */}
            <View style={styles.mapBox}>
              <MapPlaceholder />
            </View>
            <View style={{ width: w(12) }} />
            {/* Address Details */}
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <BaseText
                  title="Home" // Should be dynamic
                  size={sp(16)}
                  fontWeight="bold"
                  color={AppColors.textColorTheme}
                />
                <Pressable
                  onPress={() => {
                    router.push('/choose-location');
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <MaterialIcons
                    name="edit"
                    size={sp(14)}
                    color={AppColors.primaryColorTheme}
                  />
                  <View style={{ width: w(4) }} />
                  <BaseText
                    title={t('edit_action')}
                    size={sp(14)}
                    fontWeight="bold"
                    color={AppColors.primaryColorTheme}
                  />
                </Pressable>
              </View>
              <View style={{ height: h(4) }} />
              <TextInput
                value={address}
                onChangeText={setAddress}
                multiline
                placeholder={t('delivery_address_label')}
                placeholderTextColor={AppColors.textColor2}
                style={styles.addressInput}
              />
            </View>
          </View>
        </View>

        <View style={{ height: h(24) }} />

        {/* Delivery Time Header */}
        <BaseText
          title={t('delivery_time_label')}
          size={sp(16)}
          fontWeight="bold"
          color={AppColors.textColor2}
        />
        <View style={{ height: h(12) }} />

        <View style={{ flexDirection: 'row' }}>
          {/* Date Dropdown */}
          <View style={{ flex: 1 }}>
            <BaseText
              title={t('delivery_date_label')}
              size={sp(12)}
              color={AppColors.textColorTheme}
            />
            <View style={{ height: h(8) }} />
            <CheckoutDropdown
              value={selectedDate}
              items={[
                { value: 'today', label: t('today') },
                { value: 'tomorrow', label: 'Tomorrow' }, // Simplified for now
              ]}
              onChanged={(val) => setSelectedDate(val)}
              iconName="calendar-today"
              hint={t('select_date')}
            />
          </View>
          <View style={{ width: w(16) }} />
          {/* Time Dropdown */}
          <View style={{ flex: 1 }}>
            <BaseText
              // Reusing label, or add new "Delivery Time" label specifically for column
              title={t('delivery_time_label')}
              size={sp(12)}
              color={AppColors.textColorTheme}
            />
            <View style={{ height: h(8) }} />
            <CheckoutDropdown
              value={selectedTime}
              items={[
                { value: 'asap', label: t('asap') },
                { value: '10:00am', label: '10:00am' },
                { value: '10:30am', label: '10:30am' },
                { value: '11:00am', label: '11:00am' },
              ]}
              onChanged={(val) => setSelectedTime(val)}
              iconName="access-time" // Hourglass icon not standard, using clock
              iconIsHourglass
              hint={t('select_time')}
            />
          </View>
        </View>

        <View style={{ height: h(24) }} />

        {/* Delivery Instructions */}
        <View style={{ flexDirection: 'row' }}>
          <BaseText
            title={t('delivery_instructions_label')}
            size={sp(16)}
            color={AppColors.textColor2}
          />
          <View style={{ width: w(4) }} />
          <BaseText
            title={t('optional_label')}
            size={sp(16)}
            color={AppColors.textColor2}
          />
        </View>

        <View style={{ height: h(8) }} />
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={3}
          maxLength={100}
          placeholder={t('leave_at_door_placeholder')}
          placeholderTextColor={AppColors.textColor2}
          style={styles.instructionsInput}
          textAlignVertical="top"
        />

        <View style={{ height: h(40) }} />

        {/* Proceed Button */}
        <Pressable
          onPress={() => {
            const chosen = address.trim() || 'Damascus, Syria';
            // Merge into existing nav args so we don't clobber other keys.
            navArgs.set({
              ...navArgs.get(),
              delivery_address: chosen,
              delivery_note: instructions.trim() || undefined,
            });
            router.push('/checkout-payment');
          }}
          style={styles.proceedButton}
        >
          <BaseText
            title={t('proceed_payment')}
            size={sp(16)}
            fontWeight="bold"
            color={AppColors.white}
          />
        </Pressable>
        <View style={{ height: h(20) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(8),
    backgroundColor: AppColors.white,
  },
  appBarLeading: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarDivider: {
    height: 1,
    backgroundColor: 'rgba(143,169,189,0.3)', // AppColors.lightGray.withOpacity(0.3)
  },
  addressCard: {
    padding: w(12),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(12),
  },
  mapBox: {
    width: w(80),
    height: w(80),
    borderRadius: r(8),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#D6E0E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(12),
    paddingVertical: h(4),
    minHeight: h(40),
    backgroundColor: AppColors.lightGrey,
    borderRadius: r(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    paddingHorizontal: w(40),
  },
  modalMenu: {
    backgroundColor: AppColors.white,
    borderRadius: r(8),
    paddingVertical: h(8),
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(16),
    paddingVertical: h(12),
  },
  instructionsInput: {
    minHeight: h(80),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(8),
    padding: w(12),
    fontSize: sp(14),
    color: AppColors.textColorTheme,
  },
  addressInput: {
    padding: 0,
    fontSize: sp(12),
    color: AppColors.textColor2,
  },
  proceedButton: {
    width: '100%',
    height: h(50),
    backgroundColor: AppColors.primaryColorTheme,
    borderRadius: r(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
