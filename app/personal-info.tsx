// Personal Info — account fields plus Log out / Delete account. Name and phone
// are auto-filled from the account and locked (phone-only signup identity);
// email is the only editable field and shows "Add" when not set. No
// edit-account button and no avatar/photo upload (removed per design).
import React from 'react';
import { View, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { goBack } from '@/lib/nav';
import { showSnack } from '@/lib/snack';

// Phone-only signup auto-generates a placeholder email (temp_*@phone.login);
// treat those as "no email set" so the row shows the Add button instead.
function realEmail(email?: string): string | null {
  const e = (email ?? '').trim();
  if (!e || e.endsWith('@phone.login')) return null;
  return e;
}

export default function PersonalInfoScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const phone = [user?.countryCode, user?.phoneNumber].filter(Boolean).join(' ') ||
    user?.phone ||
    null;

  // The display name is what the user entered at signup (full name).
  const displayName = user?.fullName ?? user?.name ?? user?.username ?? null;

  // editable=false rows are locked identity fields (auto-filled, no chevron).
  // The email row is editable and shows "Add" when empty.
  const rows: { label: string; value: string | null; editable: boolean }[] = [
    { label: t('username'), value: displayName, editable: false },
    { label: t('email'), value: realEmail(user?.email), editable: true },
    { label: t('phone_number'), value: phone, editable: false },
  ];

  const onLogout = async () => {
    await useAuthStore.getState().logout();
    router.replace('/login');
  };

  const onDeleteAccount = () => {
    Alert.alert(t('delete_account'), t('do_you_delete_account'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete_account'),
        style: 'destructive',
        onPress: onLogout,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable
          onPress={() => goBack(router, '/(tabs)/profile')}
          hitSlop={8}
          style={styles.leading}
        >
          <Ionicons name="chevron-back" size={sp(24)} color={AppColors.textColorTheme} />
        </Pressable>
        <BaseText
          title={t('personal_info')}
          size={sp(18)}
          fontWeight="bold"
          color={AppColors.textColorTheme}
        />
        <View style={styles.leading} />
      </View>

      <ScrollView contentContainerStyle={{ padding: w(16) }}>
        {rows.map((row, i) => (
          <View key={row.label}>
            {i > 0 && <View style={styles.divider} />}
            <Pressable
              style={styles.row}
              disabled={!row.editable}
              onPress={() => showSnack(t('coming_soon'), 'info')}
            >
              <BaseText
                title={row.label}
                size={sp(15)}
                color={AppColors.textColorTheme}
              />
              <View style={styles.rowRight}>
                <BaseText
                  title={row.value ?? t('add')}
                  size={sp(15)}
                  color={AppColors.textColor2}
                />
                {/* Only editable rows get a chevron affordance. */}
                {row.editable && (
                  <>
                    <View style={{ width: w(6) }} />
                    <Ionicons
                      name="chevron-forward"
                      size={sp(18)}
                      color={AppColors.textColor2}
                    />
                  </>
                )}
              </View>
            </Pressable>
          </View>
        ))}

        <View style={{ height: h(24) }} />

        {/* Log out */}
        <Pressable style={styles.logoutBtn} onPress={onLogout}>
          <BaseText
            title={t('log_out')}
            size={sp(16)}
            fontWeight="bold"
            color={AppColors.textColorTheme}
          />
        </Pressable>

        <View style={{ height: h(16) }} />

        {/* Delete account */}
        <Pressable style={styles.deleteBtn} onPress={onDeleteAccount}>
          <BaseText
            title={t('delete_account')}
            size={sp(16)}
            fontWeight="bold"
            color={AppColors.red}
          />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.white },
  appBar: {
    height: h(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(8),
    backgroundColor: AppColors.white,
  },
  leading: { width: w(40), height: w(40), alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: h(18),
  },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: AppColors.dividerColor },
  logoutBtn: {
    height: h(52),
    borderRadius: r(16),
    backgroundColor: AppColors.lightGreyV2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    height: h(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
