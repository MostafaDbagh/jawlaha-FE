// Phone OTP verification. Enter the 6-digit code -> verify -> home.
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppColors, w, h, TextStyles } from '@/theme';
import { QuicksandFamily } from '@/theme/typography';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { BaseText, TextButton, LoadingButton, AppBar } from '@/components';
import { showSnack } from '@/lib/snack';
import { useNavArgs, navArgs } from '@/store/navArgs';
import { useAuthControllerStore } from '@/features/auth/authStore';

const PIN_LENGTH = 6;

export default function VerificationCodeScreen() {
  const router = useRouter();

  const navArguments = useNavArgs((s) => s.args);
  const phone: string = (navArguments?.phone as string) ?? '';
  // Reset-password flow reuses this screen but verifies via the reset endpoint.
  const resetPassword: boolean = navArguments?.resetPassword === true;

  const isLoading = useAuthControllerStore((s) => s.isLoading);
  const lastDevOtp = useAuthControllerStore((s) => s.lastDevOtp);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  // Inline error shown under the PIN row when the entered code is wrong/incomplete.
  const [otpError, setOtpError] = useState<string | null>(null);

  // Dev convenience: prefill the OTP returned by the backend (no real SMS).
  useEffect(() => {
    if (lastDevOtp && lastDevOtp.length === PIN_LENGTH) {
      setDigits(lastDevOtp.split(''));
    }
  }, [lastDevOtp]);

  const handleChange = (text: string, index: number) => {
    const value = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    // Clear a stale error as soon as the user edits the code.
    if (otpError) setOtpError(null);
    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onConfirm = async () => {
    setOtpError(null);
    const code = digits.join('');
    if (code.length !== PIN_LENGTH) {
      setOtpError(t('invalid_otp_code'));
      return;
    }
    if (resetPassword) {
      // The code is verified together with the new password on the next screen.
      navArgs.set({ phone, otp: code, resetPassword: true });
      router.push('/reset-new-password');
      return;
    }
    const ok = await useAuthControllerStore.getState().verifyOtpLogin(phone, code);
    if (ok) {
      // Correct code -> straight into the app.
      router.replace('/(tabs)');
    } else {
      // Wrong code -> keep the user here and surface the error inline.
      setOtpError(t('invalid_otp_code'));
    }
  };

  const onResend = async () => {
    const ok = resetPassword
      ? await useAuthControllerStore.getState().requestPasswordResetPhone(phone)
      : await useAuthControllerStore.getState().requestOtpLogin(phone);
    if (ok) showSnack(t('resend_code'), 'success');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AppBar title={t('verification_code')} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.container, Responsive.getResponsivePadding()]}>
          <BaseText
            title={resetPassword ? t('verify_reset_code_dsc') : t('verify_phone_dsc')}
            style={[TextStyles.bodyMedium, { color: AppColors.darkGray }]}
            textAlign="center"
          />
          {!!phone && (
            <>
              <View style={{ height: h(6) }} />
              <BaseText
                title={phone}
                style={[TextStyles.headlineMedium, { color: AppColors.primaryColorTheme }]}
                textAlign="center"
              />
            </>
          )}

          <View style={{ height: Responsive.gapLarge }} />

          <View style={styles.pinRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                value={d}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.pinField}
              />
            ))}
          </View>

          {!!otpError && (
            <>
              <View style={{ height: h(10) }} />
              <BaseText
                title={otpError}
                style={[TextStyles.bodySmall, { color: AppColors.errorColor }]}
                textAlign="center"
              />
            </>
          )}

          {__DEV__ && (
            <>
              <View style={{ height: h(10) }} />
              <BaseText
                title={t('dev_use_code').replace('@code', '000000')}
                style={[TextStyles.bodySmall, { color: AppColors.greyTextColorV3 }]}
                textAlign="center"
              />
            </>
          )}

          <View style={{ height: Responsive.gapLarge }} />

          <LoadingButton loading={isLoading} onPress={onConfirm}>
            <BaseText
              title={t('confirm')}
              style={[TextStyles.headlineMedium, { color: AppColors.white }]}
            />
          </LoadingButton>

          <View style={{ height: Responsive.gapLarge }} />

          <Pressable onPress={onResend}>
            <View style={styles.resendRow}>
              <TextButton
                title={t('resend_code')}
                textStyle={[TextStyles.bodyMedium, { color: AppColors.lightBlue }]}
              />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: h(24),
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: w(10),
  },
  pinField: {
    width: w(46),
    height: w(54),
    borderWidth: 1,
    borderColor: AppColors.darkGray,
    borderRadius: 10,
    backgroundColor: AppColors.white,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: QuicksandFamily.medium,
    color: AppColors.textColorTheme,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: w(6),
  },
});
