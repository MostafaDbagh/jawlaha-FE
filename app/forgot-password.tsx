// Phone-based forgot password. Enter phone -> SMS code -> verify -> reset.
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppColors, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { screenHeight } from '@/theme/scale';
import { t, useI18n } from '@/i18n';
import { AppBar, BaseText, AppTextField, LoadingButton } from '@/components';
import { Validator } from '@/lib/validators';
import { toApiPhone } from '@/lib/phone';
import { navArgs } from '@/store/navArgs';
import { useAuthControllerStore } from '@/features/auth/authStore';

// Flutter toolbar / bottom-nav heights (kToolbarHeight / kBottomNavigationBarHeight)
const kToolbarHeight = 56;
const kBottomNavigationBarHeight = 56;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const { isRTL } = useI18n();
  const isLoading = useAuthControllerStore((s) => s.isLoading);
  const countryCode = useAuthControllerStore((s) => s.countryCode);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const height = screenHeight - kToolbarHeight - kBottomNavigationBarHeight;

  const onSend = async () => {
    const err = Validator.phoneNumberValid(phoneNumber);
    setPhoneError(err);
    if (err) return;

    const fullPhone = toApiPhone(countryCode.phoneCode, phoneNumber);
    const ok = await useAuthControllerStore
      .getState()
      .requestPasswordResetPhone(fullPhone);
    if (ok) {
      // Carry the phone forward; verification-code runs in reset mode.
      navArgs.set({ phone: fullPhone, resetPassword: true });
      router.push('/verification-code');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AppBar title={t('forgot_password')} />
      <ScrollView>
        <View
          style={[
            styles.container,
            { height },
            Responsive.getResponsivePadding(),
          ]}
        >
          <BaseText
            title={t('forgot_password_phone_desc')}
            style={[TextStyles.bodyMedium, { color: AppColors.darkGray }]}
            textAlign="center"
          />
          <View style={{ height: Responsive.gap }} />
          {/* Phone field */}
          <View style={{ gap: Responsive.gapSmall, width: '100%' }}>
            <AppTextField
              label={`${t('phone_number')} *`}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              borderStyleType="outlineInput"
              keyboardType="phone-pad"
              hintText="9xxxxxxxx"
              errorText={phoneError}
              validator={(value) => Validator.phoneNumberValid(value)}
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
          <View style={{ height: Responsive.gapLarge }} />
          <LoadingButton loading={isLoading} onPress={onSend}>
            <BaseText
              title={t('send_code')}
              style={[TextStyles.headlineMedium, { color: AppColors.white }]}
            />
          </LoadingButton>
          <View style={{ height: Responsive.gapLarge }} />
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
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialCode: {
    minWidth: 56,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: AppColors.dividerColor,
  },
});
