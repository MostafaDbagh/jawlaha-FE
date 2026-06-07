// City picker — the customer chooses their city so the home shows only
// restaurants in it. Reached on first run (no city yet) and from the home
// location header. Persists via the city store.
import React, { useState } from 'react';
import { View, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { t, useI18n } from '@/i18n';
import { AppBar, BaseText } from '@/components';
import { goBack } from '@/lib/nav';
import { SYRIAN_CITIES, cityLabel, type City } from '@/lib/cities';
import { useCityStore } from '@/features/location/cityStore';
import { useHomeStore } from '@/features/home/homeStore';

export default function SelectCityScreen() {
  const router = useRouter();
  const { lang } = useI18n();
  const current = useCityStore((s) => s.city);
  const [q, setQ] = useState('');

  const query = q.trim().toLowerCase();
  const cities = !query
    ? SYRIAN_CITIES
    : SYRIAN_CITIES.filter((c) => c.en.toLowerCase().includes(query) || c.ar.includes(q.trim()));

  const onSelect = async (city: City) => {
    await useCityStore.getState().setCity(city);
    // Refresh restaurants for the new city right away.
    useHomeStore.getState().getNearbyBranches();
    goBack(router, '/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AppBar title={t('select_city')} onBack={() => goBack(router, '/(tabs)')} />

      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={sp(20)} color={AppColors.textColor2} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('search_city')}
          placeholderTextColor={AppColors.textColor2}
          style={styles.search}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: h(24) }} keyboardShouldPersistTaps="handled">
        {cities.map((c) => {
          const active = current?.key === c.key;
          return (
            <Pressable key={c.key} style={styles.row} onPress={() => onSelect(c)}>
              <MaterialIcons
                name="location-city"
                size={sp(20)}
                color={active ? AppColors.primaryColorTheme : AppColors.textColor2}
              />
              <BaseText
                title={cityLabel(c, lang)}
                style={{
                  flex: 1,
                  marginHorizontal: w(12),
                  fontSize: sp(15),
                  color: active ? AppColors.primaryColorTheme : AppColors.textColorTheme,
                }}
                fontWeight={active ? 'bold' : '500'}
              />
              {active ? (
                <MaterialIcons name="check" size={sp(20)} color={AppColors.primaryColorTheme} />
              ) : null}
            </Pressable>
          );
        })}
        {cities.length === 0 && (
          <BaseText
            title={t('no_data')}
            style={{ textAlign: 'center', marginTop: h(40), color: AppColors.textColor2 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.white },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: w(16),
    marginVertical: h(8),
    paddingHorizontal: w(12),
    height: h(44),
    borderRadius: r(10),
    backgroundColor: AppColors.lightGreyV2,
  },
  search: {
    flex: 1,
    marginHorizontal: w(8),
    fontSize: sp(15),
    color: AppColors.textColorTheme,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(20),
    paddingVertical: h(14),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGreyV2,
  },
});
