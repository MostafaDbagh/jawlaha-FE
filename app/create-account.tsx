// Phone + password sign up. Full name + phone + password -> home.
// Registers via auth/register (passes fullName as the display name) and logs
// the user straight in on success.
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
import { PasswordStrengthBar, isPasswordValid } from '@/components/PasswordStrengthBar';
import { toApiPhone } from '@/lib/phone';
import { showSnack } from '@/lib/snack';
import { navArgs } from '@/store/navArgs';
import { useAuthControllerStore } from '@/features/auth/authStore';

// Empty → "enter a password"; otherwise enforce the backend strength rule and
// surface it as the field's inline error span (not a generic server toast).
function validatePasswordField(value: string): string | null {
  if (value.trim().length === 0) return t('plz_enter_valid_password');
  if (!isPasswordValid(value)) return t('password_too_weak');
  return null;
}

export default function CreateAccountScreen() {
  const router = useRouter();

  const { isRTL } = useI18n();
  const isLoading = useAuthControllerStore((s) => s.isLoading);
  const countryCode = useAuthControllerStore((s) => s.countryCode);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function onSignUp() {
    const nameErr = Validator.emptyText(fullName);
    const phoneErr = Validator.phoneNumberValid(phoneNumber);
    const passErr = validatePasswordField(password);
    const confirmErr = Validator.matchPassword(password, confirmPassword);
    setNameError(nameErr);
    setPhoneError(phoneErr);
    setPasswordError(passErr);
    setConfirmError(confirmErr);
    if (nameErr || phoneErr || passErr || confirmErr) return;

    if (!agreed) {
      showSnack(t('plz_agree_terms'), 'error');
      return;
    }

    // Backend expects the Syrian leading-0 form: +[dial]0[number]. Registering
    // with this exact string means a later login (also leading-0) finds the
    // account — register + login both parse the last 10 digits. See toApiPhone.
    const fullPhone = toApiPhone(countryCode.phoneCode, phoneNumber);
    const ok = await useAuthControllerStore.getState().registerWithPhone({
      fullName: fullName.trim(),
      countryCode: countryCode.phoneCode,
      phoneNumber: fullPhone,
      password,
    });
    if (ok) {
      // Account created. Gate entry on SMS verification: issue an OTP for this
      // phone, then send the user to the verification screen (a correct code
      // lands them on home; a wrong one shows an inline error there).
      await useAuthControllerStore.getState().requestOtpLogin(fullPhone, fullName.trim());
      navArgs.set({ phone: fullPhone });
      router.replace('/verification-code');
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
        <BaseText title={t('create_account')} style={TextStyles.titleLarge} textAlign="center" />
        <View style={{ height: h(8) }} />
        <BaseText
          title={t('create_account_subtitle')}
          style={[TextStyles.bodyMedium, { color: AppColors.greyTextColorV3 }]}
          textAlign="center"
        />
        <View style={{ height: h(32) }} />

        {/* Full name */}
        <View style={{ alignSelf: 'stretch' }}>
          <AppTextField
            label={`${t('full_name')} *`}
            value={fullName}
            onChangeText={setFullName}
            borderStyleType="outlineInput"
            hintText={t('enter_your_full_name')}
            validator={(v) => Validator.emptyText(v)}
            errorText={nameError}
            prefixIcon={
              <Ionicons
                name="person-outline"
                size={sp(20)}
                color={AppColors.hintColor}
              />
            }
          />
        </View>

        <View style={{ height: h(16) }} />

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

        {/* Password */}
        <View style={{ alignSelf: 'stretch' }}>
          <AppTextField
            label={`${t('password')} *`}
            value={password}
            onChangeText={setPassword}
            borderStyleType="outlineInput"
            obscureText={!showPassword}
            hintText={t('enter_your_password')}
            validator={validatePasswordField}
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

        <PasswordStrengthBar password={password} />

        <View style={{ height: h(16) }} />

        {/* Confirm password */}
        <View style={{ alignSelf: 'stretch' }}>
          <AppTextField
            label={`${t('confirm_password')} *`}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            borderStyleType="outlineInput"
            obscureText={!showConfirm}
            hintText={t('confirm_your_password')}
            validator={(v) => Validator.matchPassword(password, v)}
            errorText={confirmError}
            prefixIcon={
              <Ionicons
                name="lock-closed-outline"
                size={sp(20)}
                color={AppColors.hintColor}
              />
            }
            suffixIcon={
              <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={sp(20)}
                  color={AppColors.hintColor}
                />
              </Pressable>
            }
          />
        </View>

        <View style={{ height: h(20) }} />

        {/* Agree to terms */}
        <Pressable
          style={[
            styles.termsRow,
            { flexDirection: 'row', direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          onPress={() => setAgreed((v) => !v)}
          hitSlop={6}
        >
          <View
            style={[styles.checkbox, agreed && styles.checkboxChecked]}
          >
            {agreed && <BaseText title="✓" style={styles.checkmark} />}
          </View>
          <BaseText
            title={`${t('i_agree_to')} `}
            style={[TextStyles.bodyMedium, { color: AppColors.greyTextColorV3 }]}
          />
          <Pressable onPress={() => router.push('/privacy-policy')} hitSlop={6}>
            <BaseText
              title={t('terms_and_conditions')}
              style={[TextStyles.bodyMedium, styles.termsLink]}
            />
          </Pressable>
        </Pressable>

        <View style={{ height: h(28) }} />

        <View style={{ alignSelf: 'stretch' }}>
          <LoadingButton loading={isLoading} onPress={onSignUp}>
            <BaseText
              title={t('sign_up')}
              style={[TextStyles.headlineMedium, { color: AppColors.white }]}
            />
          </LoadingButton>
        </View>

        <View style={{ height: h(20) }} />

        {/* Already have an account? Log in */}
        <Pressable
          style={[
            styles.loginRow,
            { flexDirection: 'row', direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          onPress={() => router.replace('/login')}
          hitSlop={8}
        >
          <BaseText
            title={`${t('already_have_account')} `}
            style={[TextStyles.bodyMedium, { color: AppColors.greyTextColorV3 }]}
          />
          <BaseText title={t('login')} style={[TextStyles.bodyMedium, styles.termsLink]} />
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexWrap: 'wrap',
  },
  checkbox: {
    width: r(20),
    height: r(20),
    borderRadius: r(5),
    borderWidth: 1.5,
    borderColor: AppColors.greyTextColorV3,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: w(10),
  },
  checkboxChecked: {
    backgroundColor: AppColors.primaryColorTheme,
    borderColor: AppColors.primaryColorTheme,
  },
  checkmark: {
    color: AppColors.white,
    fontSize: 13,
    lineHeight: 16,
  },
  termsLink: {
    color: AppColors.primaryColorTheme,
    textDecorationLine: 'underline',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
