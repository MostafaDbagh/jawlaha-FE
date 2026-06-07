// Phone + password login. Enter phone & password -> home.
import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t, useI18n } from '@/i18n';
import { AppImage, BaseText, LoadingButton, AppTextField } from '@/components';
import { Res } from '@/lib/assets';
import { Validator } from '@/lib/validators';
import { toApiPhone } from '@/lib/phone';
import { useAuthControllerStore } from '@/features/auth/authStore';

export default function LoginScreen() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { isRTL } = useI18n();
  const isLoading = useAuthControllerStore((s) => s.isLoading);
  const countryCode = useAuthControllerStore((s) => s.countryCode);

  async function onContinue() {
    const phoneErr = Validator.phoneNumberValid(phoneNumber);
    const passErr = Validator.emptyText(password, 'plz_enter_valid_password');
    setPhoneError(phoneErr);
    setPasswordError(passErr);
    if (phoneErr || passErr) return;

    // Backend expects the Syrian leading-0 form: +[dial]0[number]. See toApiPhone.
    const fullPhone = toApiPhone(countryCode.phoneCode, phoneNumber);
    const ok = await useAuthControllerStore
      .getState()
      .loginWithPhone(fullPhone, password);
    if (ok) {
      router.replace('/(tabs)');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, Responsive.getResponsivePadding()]}
        keyboardShouldPersistTaps="handled"
      >
        <AppImage
          source={Res.authLogo}
          style={{ height: h(48), width: w(140) }}
          contentFit="contain"
        />
        <View style={{ height: h(24) }} />
        <BaseText title={t('welcome_back')} style={TextStyles.titleLarge} textAlign="center" />
        <View style={{ height: h(8) }} />
        <BaseText
          title={t('login_with_password_dsc')}
          style={[TextStyles.bodyMedium, { color: AppColors.greyTextColorV3 }]}
          textAlign="center"
        />
        <View style={{ height: h(36) }} />

        {/* Phone field */}
        <View style={{ alignSelf: 'stretch' }}>
          <AppTextField
            label={`${t('phone_number')} *`}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            borderStyleType="outlineInput"
            keyboardType="phone-pad"
            hintText="9xxxxxxxx"
            validator={(value) => Validator.phoneNumberValid(value)}
            errorText={phoneError}
            prefixIcon={
              <View
                style={[
                  styles.dialCode,
                  isRTL
                    ? { borderRightWidth: 0, borderLeftWidth: 1, borderLeftColor: AppColors.dividerColor }
                    : null,
                ]}
              >
                <BaseText title={`+${countryCode.phoneCode}`} style={TextStyles.bodyMedium} />
              </View>
            }
          />
        </View>

        <View style={{ height: h(16) }} />

        {/* Password field */}
        <View style={{ alignSelf: 'stretch' }}>
          <AppTextField
            label={`${t('password')} *`}
            value={password}
            onChangeText={setPassword}
            borderStyleType="outlineInput"
            obscureText={!showPassword}
            hintText={t('enter_your_password')}
            validator={(value) => Validator.emptyText(value, 'plz_enter_valid_password')}
            errorText={passwordError}
            prefixIcon={
              <Ionicons
                name="lock-closed-outline"
                size={sp(20)}
                color={AppColors.hintColor}
              />
            }
            suffixIcon={
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={sp(20)}
                  color={AppColors.hintColor}
                />
              </Pressable>
            }
          />
        </View>

        <View style={{ height: h(12) }} />

        {/* Forgot password — native layout is pinned LTR, so flex-end is the
            right edge. Keep it on the right under the right-aligned Arabic
            labels (RTL) and at the conventional end position in English. */}
        <Pressable
          onPress={() => router.push('/forgot-password')}
          hitSlop={8}
          style={{ alignSelf: 'flex-end' }}
        >
          <BaseText
            title={t('forgot_password_question')}
            style={[TextStyles.bodyMedium, { color: AppColors.primaryColor }]}
          />
        </Pressable>

        <View style={{ height: h(20) }} />

        <View style={{ alignSelf: 'stretch' }}>
          <LoadingButton loading={isLoading} onPress={onContinue}>
            <BaseText
              title={t('continue_label')}
              style={[TextStyles.headlineMedium, { color: AppColors.white }]}
            />
          </LoadingButton>
        </View>

        <View style={{ height: h(24) }} />
        <Pressable
          onPress={() => router.push('/create-account')}
          hitSlop={8}
          style={[
            styles.registerRow,
            { flexDirection: 'row', direction: isRTL ? 'rtl' : 'ltr' },
          ]}
        >
          <BaseText
            title={t('not_have_account')}
            style={[TextStyles.bodyMedium, { color: AppColors.greyTextColorV3 }]}
          />
          <View style={{ width: w(4) }} />
          <BaseText
            title={t('register')}
            style={[TextStyles.bodyMedium, { color: AppColors.primaryColor }]}
            fontWeight="bold"
          />
        </Pressable>

        <View style={{ height: h(16) }} />

        {/* Browse without an account — guests can explore; sign-in is only
            required at checkout (see splash routing in app/index.tsx). */}
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          hitSlop={8}
          style={styles.guestRow}
        >
          <Ionicons
            name="person-circle-outline"
            size={sp(18)}
            color={AppColors.greyTextColorV3}
          />
          <View style={{ width: w(6) }} />
          <BaseText
            title={t('browse_as_guest')}
            style={[TextStyles.bodyMedium, { color: AppColors.greyTextColorV3 }]}
            fontWeight="bold"
          />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: h(24),
  },
  dialCode: {
    minWidth: w(64),
    paddingHorizontal: w(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: AppColors.dividerColor,
  },
  registerRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
