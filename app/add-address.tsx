// Ported from lib/screens/cart/add_address_screen.dart (AddAddressScreen)
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import { useNavArgs } from '@/store/navArgs';

// const _initialPosition = {
//   target: { latitude: 25.1972, longitude: 55.2744 }, // Dubai Downtown
//   zoom: 14.4746,
// };

export default function AddAddressScreen() {
  const router = useRouter();
  const isEdit: boolean = useNavArgs((s) => s.args.isEdit) ?? false;

  // Default values if editing could be loaded here
  const [name, setName] = useState<string>(isEdit ? 'Home' : '');
  const [building, setBuilding] = useState<string>(
    isEdit ? 'Apartment 503, Al Nakheel Tower' : '',
  );
  const [street, setStreet] = useState<string>(isEdit ? 'Sheikh Zayed Road' : '');
  const [city, setCity] = useState<string>(isEdit ? 'Dubai, UAE' : '');
  const [entrance, setEntrance] = useState<string>(isEdit ? 'Main gate' : '');
  const [notes, setNotes] = useState<string>('');

  const buildLabel = (text: string, icon?: keyof typeof MaterialIcons.glyphMap) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {icon != null ? (
        <>
          <MaterialIcons name={icon} size={sp(18)} color={AppColors.textColor2} />
          <View style={{ width: w(8) }} />
        </>
      ) : null}
      <BaseText
        title={text}
        style={{
          fontSize: sp(14),
          color: AppColors.textColor2,
          fontWeight: '500', // Slight weight for labels
        }}
      />
    </View>
  );

  const buildTextField = (
    value: string,
    onChangeText: (v: string) => void,
    hint: string,
  ) => <AddressField value={value} onChangeText={onChangeText} hint={hint} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <BaseText
            title={
              isEdit
                ? t('edit_delivery_address')
                : t('add_delivery_address')
            }
            style={{ fontSize: sp(18), fontWeight: 'bold', color: AppColors.textColorTheme }}
          />
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="close" size={sp(24)} color={AppColors.textColorTheme} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.appBarDivider} />

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: w(16) }}>
          {/* Map Preview */}
          {/* Map Preview */}
          <View style={styles.mapContainer}>
            {/* TODO: maps native feature — google_maps_flutter not ported. Placeholder. */}
            <View style={styles.mapPlaceholder}>
              <MaterialIcons name="map" size={sp(40)} color={AppColors.lightGray} />
            </View>
          </View>
          <View style={{ height: h(24) }} />

          {/* Address Name */}
          {buildLabel(t('address_name_label'), 'home')}
          <View style={{ height: h(8) }} />
          {buildTextField(name, setName, 'Home')}

          <View style={{ height: h(16) }} />

          {/* Building / Villa */}
          {buildLabel(t('building_villa_label'))}
          <View style={{ height: h(8) }} />
          {buildTextField(building, setBuilding, '')}

          <View style={{ height: h(16) }} />

          {/* Street Name */}
          {buildLabel(t('street_name_label'))}
          <View style={{ height: h(8) }} />
          {buildTextField(street, setStreet, '')}

          <View style={{ height: h(16) }} />

          {/* City/Area */}
          {buildLabel(t('city_area_label'))}
          <View style={{ height: h(8) }} />
          {buildTextField(city, setCity, '')}

          <View style={{ height: h(16) }} />

          {/* Building Entrance */}
          {buildLabel(t('building_entrance_label'))}
          <View style={{ height: h(8) }} />
          {buildTextField(entrance, setEntrance, '')}

          <View style={{ height: h(16) }} />

          {/* Additional Notes */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <BaseText
              title={`${t('additional_notes_label')} ${t('optional_label')}`}
              style={{ fontSize: sp(14), color: AppColors.textColor2 }}
            />
            <BaseText
              title="0/100"
              style={{ fontSize: sp(12), color: AppColors.textColor2 }}
            />
          </View>
          <View style={{ height: h(8) }} />
          <NotesField value={notes} onChangeText={setNotes} />
          <View style={{ height: h(100) }} />{/* Space for bottom button */}
        </ScrollView>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            // Save logic
            router.back();
          }}
          style={styles.saveButton}
        >
          <BaseText
            title={isEdit ? t('save_address_btn') : t('add_address_btn')}
            style={{ color: AppColors.white, fontSize: sp(16), fontWeight: 'bold' }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function AddressField({
  value,
  onChangeText,
  hint,
}: {
  value: string;
  onChangeText: (v: string) => void;
  hint: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={hint}
      placeholderTextColor={AppColors.textColor2}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.field,
        {
          borderColor: focused ? AppColors.primaryColorTheme : AppColors.lightGreyV2,
        },
      ]}
    />
  );
}

function NotesField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      multiline
      numberOfLines={4}
      maxLength={100}
      placeholder={t('leave_at_door_placeholder')} // Reusing similar placeholder or generic one
      placeholderTextColor={AppColors.textColor2}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.notesField,
        {
          borderColor: focused ? AppColors.primaryColorTheme : AppColors.lightGreyV2,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  appBar: {
    backgroundColor: AppColors.white,
    paddingHorizontal: w(16),
    paddingVertical: h(8),
    justifyContent: 'center',
  },
  appBarDivider: {
    height: 1,
    backgroundColor: AppColors.lightGray + '4D', // withOpacity(0.3)
  },
  mapContainer: {
    height: h(140),
    width: '100%',
    borderRadius: r(12),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: AppColors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  field: {
    borderWidth: 1,
    borderRadius: r(8),
    paddingHorizontal: w(16),
    paddingVertical: h(14),
    fontSize: sp(16),
    color: AppColors.textColorTheme,
    backgroundColor: AppColors.white,
  },
  notesField: {
    borderWidth: 1,
    borderRadius: r(8),
    padding: w(12),
    minHeight: h(100),
    textAlignVertical: 'top',
    fontSize: sp(14),
    color: AppColors.textColorTheme,
    backgroundColor: AppColors.white,
  },
  bottomBar: {
    padding: w(16),
    backgroundColor: AppColors.white,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  saveButton: {
    width: '100%',
    height: h(50),
    backgroundColor: AppColors.primaryColorTheme,
    borderRadius: r(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
