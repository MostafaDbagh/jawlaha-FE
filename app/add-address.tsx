// Ported from lib/screens/cart/add_address_screen.dart (AddAddressScreen)
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { QuicksandFamily, quicksand } from '@/theme/typography';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import { showSnack } from '@/lib/snack';
import { goBack } from '@/lib/nav';
import { useI18n } from '@/i18n';
import { useNavArgs } from '@/store/navArgs';
import { useAddressStore, type AddressIcon } from '@/features/addresses/addressStore';
import { useCityStore } from '@/features/location/cityStore';
import { SYRIAN_CITIES, cityLabel, type City } from '@/lib/cities';

// Preset address names for the address-name dropdown.
const ADDRESS_NAME_KEYS = ['home_label', 'office_label', 'work_label', 'other_label'] as const;

// Pick a list icon from the address name so Home/Work get the right glyph.
function iconForName(name: string): AddressIcon {
  const n = name.trim().toLowerCase();
  if (n.includes('home') || n.includes('منزل')) return 'home';
  if (n.includes('work') || n.includes('office') || n.includes('عمل')) return 'work';
  return 'other';
}

export default function AddAddressScreen() {
  const router = useRouter();
  const { lang } = useI18n();
  const isEdit: boolean = useNavArgs((s) => s.args.isEdit) ?? false;
  const addressId: string | undefined = useNavArgs((s) => s.args.addressId);
  const existing = useAddressStore((s) =>
    addressId ? s.addresses.find((a) => a.id === addressId) : undefined,
  );

  // Editing pre-fills the name + collapses the saved details into the building
  // line (the store keeps a single details string, not separate fields).
  const [name, setName] = useState<string>(existing?.title ?? '');
  // Canonical city object (drives the home's city filter when saved).
  const [city, setCity] = useState<City | null>(useCityStore.getState().city);
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [building, setBuilding] = useState<string>(existing?.details ?? '');
  const [floor, setFloor] = useState<string>('');
  const [landmarks, setLandmarks] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [cityOpen, setCityOpen] = useState<boolean>(false);
  const [nameOpen, setNameOpen] = useState<boolean>(false);

  const onSave = async () => {
    const title = name.trim() || t('home_label');
    const cityText = city ? cityLabel(city, lang) : '';
    const details = [cityText, neighborhood, building, floor, landmarks]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');
    const store = useAddressStore.getState();
    if (isEdit && addressId) {
      await store.updateAddress(addressId, { title, details, icon: iconForName(title) });
    } else {
      await store.addAddress({
        title,
        details,
        icon: iconForName(title),
        isDefault: store.addresses.length === 0,
      });
    }
    // Choosing your address city also sets the city the home filters restaurants by.
    if (city) await useCityStore.getState().setCity(city);
    showSnack(t('address_saved'), 'success');
    goBack(router, '/saved-addresses');
  };

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
          fontFamily: quicksand('500'), // Slight weight for labels
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
            style={{ fontSize: sp(18), fontFamily: quicksand('bold'), color: AppColors.textColorTheme }}
          />
          <TouchableOpacity onPress={() => goBack(router, '/saved-addresses')}>
            <MaterialIcons name="close" size={sp(24)} color={AppColors.textColorTheme} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.appBarDivider} />

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: w(16) }}>
          {/* Address Name — dropdown of presets */}
          {buildLabel(t('address_name_label'), 'home')}
          <View style={{ height: h(8) }} />
          <Pressable style={styles.dropdown} onPress={() => setNameOpen(true)}>
            <BaseText
              title={name || t('select_address_name_hint')}
              style={{
                fontSize: sp(16),
                color: name ? AppColors.textColorTheme : AppColors.textColor2,
              }}
            />
            <MaterialIcons name="arrow-drop-down" size={sp(24)} color={AppColors.textColor2} />
          </Pressable>

          <View style={{ height: h(16) }} />

          {/* City — dropdown of Syrian cities */}
          {buildLabel(t('city_label'), 'location-city')}
          <View style={{ height: h(8) }} />
          <Pressable style={styles.dropdown} onPress={() => setCityOpen(true)}>
            <BaseText
              title={city ? cityLabel(city, lang) : t('select_city_hint')}
              style={{
                fontSize: sp(16),
                color: city ? AppColors.textColorTheme : AppColors.textColor2,
              }}
            />
            <MaterialIcons name="arrow-drop-down" size={sp(24)} color={AppColors.textColor2} />
          </Pressable>

          <View style={{ height: h(16) }} />

          {/* Neighborhood */}
          {buildLabel(t('neighborhood_label'))}
          <View style={{ height: h(8) }} />
          {buildTextField(neighborhood, setNeighborhood, '')}

          <View style={{ height: h(16) }} />

          {/* Building Name */}
          {buildLabel(t('building_name_label'))}
          <View style={{ height: h(8) }} />
          {buildTextField(building, setBuilding, '')}

          <View style={{ height: h(16) }} />

          {/* Floor */}
          {buildLabel(t('floor_label'))}
          <View style={{ height: h(8) }} />
          {buildTextField(floor, setFloor, '')}

          <View style={{ height: h(16) }} />

          {/* Nearby Landmarks */}
          {buildLabel(t('nearby_landmarks_label'), 'place')}
          <View style={{ height: h(8) }} />
          {buildTextField(landmarks, setLandmarks, '')}

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
          onPress={onSave}
          style={styles.saveButton}
        >
          <BaseText
            title={isEdit ? t('save_address_btn') : t('add_address_btn')}
            style={{ color: AppColors.white, fontSize: sp(16), fontFamily: quicksand('bold') }}
          />
        </TouchableOpacity>
      </View>

      {/* Address name picker */}
      <Modal
        visible={nameOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNameOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setNameOpen(false)}>
          <View style={styles.modalMenu}>
            <BaseText
              title={t('select_address_name_hint')}
              style={{
                fontSize: sp(16),
                fontFamily: quicksand('bold'),
                color: AppColors.textColorTheme,
                paddingHorizontal: w(20),
                paddingVertical: h(12),
              }}
            />
            <View style={styles.appBarDivider} />
            {ADDRESS_NAME_KEYS.map((key) => {
              const label = t(key);
              return (
                <Pressable
                  key={key}
                  style={styles.modalItem}
                  onPress={() => {
                    setName(label);
                    setNameOpen(false);
                  }}
                >
                  <BaseText
                    title={label}
                    style={{
                      fontSize: sp(15),
                      color: label === name ? AppColors.primaryColorTheme : AppColors.textColorTheme,
                      fontFamily: label === name ? quicksand('bold') : quicksand('500'),
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* City picker */}
      <Modal
        visible={cityOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCityOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCityOpen(false)}>
          <View style={styles.modalMenu}>
            <BaseText
              title={t('select_city_hint')}
              style={{
                fontSize: sp(16),
                fontFamily: quicksand('bold'),
                color: AppColors.textColorTheme,
                paddingHorizontal: w(20),
                paddingVertical: h(12),
              }}
            />
            <View style={styles.appBarDivider} />
            <ScrollView style={{ maxHeight: h(360) }}>
              {SYRIAN_CITIES.map((c) => (
                <Pressable
                  key={c.key}
                  style={styles.modalItem}
                  onPress={() => {
                    setCity(c);
                    setCityOpen(false);
                  }}
                >
                  <BaseText
                    title={cityLabel(c, lang)}
                    style={{
                      fontSize: sp(15),
                      color: c.key === city?.key ? AppColors.primaryColorTheme : AppColors.textColorTheme,
                      fontFamily: c.key === city?.key ? quicksand('bold') : quicksand('500'),
                    }}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  field: {
    borderWidth: 1,
    borderRadius: r(8),
    paddingHorizontal: w(16),
    paddingVertical: h(14),
    fontSize: sp(16),
    fontFamily: QuicksandFamily.regular,
    color: AppColors.textColorTheme,
    backgroundColor: AppColors.white,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(8),
    paddingHorizontal: w(16),
    paddingVertical: h(14),
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    paddingHorizontal: w(40),
  },
  modalMenu: {
    backgroundColor: AppColors.white,
    borderRadius: r(12),
    paddingVertical: h(8),
    overflow: 'hidden',
  },
  modalItem: { paddingHorizontal: w(20), paddingVertical: h(14) },
  notesField: {
    borderWidth: 1,
    borderRadius: r(8),
    padding: w(12),
    minHeight: h(100),
    textAlignVertical: 'top',
    fontSize: sp(14),
    fontFamily: QuicksandFamily.regular,
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
