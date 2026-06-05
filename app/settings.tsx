// Settings screen — language, dark mode, and push-notification preferences.
// Layout follows the Jawla Figma; colors use the app's teal theme.
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { t, useI18n, type LangCode } from '@/i18n';
import { BaseText } from '@/components';
import { useSettingsStore } from '@/features/settings/settingsStore';
import { goBack } from '@/lib/nav';

export default function SettingsScreen() {
  const router = useRouter();
  const { lang, setLang } = useI18n();

  const s = useSettingsStore();
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    useSettingsStore.getState().hydrate();
  }, []);

  const langLabel = lang === 'ar' ? 'العربية' : t('english');

  const trackColor = { false: AppColors.greyv2, true: AppColors.primaryColor };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable onPress={() => goBack(router, '/(tabs)/profile')} hitSlop={8} style={styles.leading}>
          <Ionicons name="arrow-back" size={sp(24)} color={AppColors.textColorTheme} />
        </Pressable>
        <BaseText
          title={t('settings')}
          size={sp(18)}
          fontWeight="bold"
          color={AppColors.textColorTheme}
        />
        <View style={styles.leading} />
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={{ padding: w(16) }}>
        <View style={styles.card}>
          <BaseText
            title={t('settings')}
            size={sp(18)}
            fontWeight="bold"
            color={AppColors.textColorTheme}
          />
          <View style={{ height: h(20) }} />

          {/* Language */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <BaseText
                title={t('language')}
                size={sp(15)}
                color={AppColors.textColorTheme}
              />
              <View style={{ height: h(2) }} />
              <BaseText title={langLabel} size={sp(13)} color={AppColors.textColor2} />
            </View>
            <Pressable style={styles.langSelect} onPress={() => setLangOpen(true)}>
              <BaseText
                title={langLabel}
                size={sp(14)}
                color={AppColors.textColorTheme}
              />
              <View style={{ width: w(4) }} />
              <MaterialIcons
                name="keyboard-arrow-down"
                size={sp(20)}
                color={AppColors.textColorTheme}
              />
            </Pressable>
          </View>

          <View style={{ height: h(20) }} />

          {/* Dark Mode */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <BaseText
                title={t('dark_mode')}
                size={sp(15)}
                color={AppColors.textColorTheme}
              />
              <View style={{ height: h(2) }} />
              <BaseText
                title={s.darkMode ? t('on_label') : t('off_label')}
                size={sp(13)}
                color={AppColors.textColor2}
              />
            </View>
            <Switch
              value={s.darkMode}
              onValueChange={(v) => s.set({ darkMode: v })}
              trackColor={trackColor}
              thumbColor={AppColors.white}
            />
          </View>

          <View style={{ height: h(20) }} />
          <View style={styles.innerDivider} />
          <View style={{ height: h(20) }} />

          {/* Push notifications (master) */}
          <View style={styles.row}>
            <BaseText
              title={t('push_notifications')}
              size={sp(15)}
              color={AppColors.textColorTheme}
            />
            <Switch
              value={s.pushNotifications}
              onValueChange={(v) => s.set({ pushNotifications: v })}
              trackColor={trackColor}
              thumbColor={AppColors.white}
            />
          </View>

          {/* Sub-toggles — disabled when push notifications is off */}
          {(
            [
              ['promotions', s.promotions, (v: boolean) => s.set({ promotions: v })],
              ['order_updates', s.orderUpdates, (v: boolean) => s.set({ orderUpdates: v })],
              ['trip_reminders', s.tripReminders, (v: boolean) => s.set({ tripReminders: v })],
            ] as const
          ).map(([key, val, onChange]) => (
            <View key={key} style={styles.subRow}>
              <BaseText
                title={t(key)}
                size={sp(14)}
                color={s.pushNotifications ? AppColors.textColor3 : AppColors.textColor2}
              />
              <Switch
                value={s.pushNotifications && val}
                disabled={!s.pushNotifications}
                onValueChange={onChange}
                trackColor={trackColor}
                thumbColor={AppColors.white}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Language picker */}
      <Modal
        visible={langOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLangOpen(false)}>
          <View style={styles.modalMenu}>
            {(['en', 'ar'] as LangCode[]).map((code) => {
              const label = code === 'ar' ? 'العربية' : t('english');
              const selected = lang === code;
              return (
                <Pressable
                  key={code}
                  style={styles.modalItem}
                  onPress={async () => {
                    await setLang(code);
                    setLangOpen(false);
                  }}
                >
                  <BaseText
                    title={label}
                    size={sp(15)}
                    color={selected ? AppColors.primaryColor : AppColors.textColorTheme}
                    fontWeight={selected ? 'bold' : 'normal'}
                  />
                  {selected && (
                    <MaterialIcons
                      name="check"
                      size={sp(18)}
                      color={AppColors.primaryColor}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
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
  card: {
    backgroundColor: AppColors.sectionBackgroungColorV3,
    borderRadius: r(16),
    padding: w(16),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: w(8),
    marginTop: h(14),
  },
  innerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.dividerColor,
  },
  langSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(12),
    height: h(40),
    backgroundColor: AppColors.white,
    borderRadius: r(8),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
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
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(20),
    paddingVertical: h(14),
  },
});
