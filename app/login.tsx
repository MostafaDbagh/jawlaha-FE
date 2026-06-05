// Phone-only login (Keeta-style). Enter phone -> OTP -> home.
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppImage, BaseText, LoadingButton, AppTextField } from '@/components';
import { Res } from '@/lib/assets';
import { Validator } from '@/lib/validators';
import { navArgs } from '@/store/navArgs';
import { useAuthControllerStore } from '@/features/auth/authStore';

export default function LoginScreen() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const isLoading = useAuthControllerStore((s) => s.isLoading);
  const countryCode = useAuthControllerStore((s) => s.countryCode);

  async function onContinue() {
    const err = Validator.phoneNumberValid(phoneNumber);
    setPhoneError(err);
    if (err) return;

    // Backend expects +[dial][number]; it auto-creates the account if new.
    const fullPhone = `+${countryCode.phoneCode}${phoneNumber.trim()}`;
    const ok = await useAuthControllerStore.getState().requestOtpLogin(fullPhone);
    if (ok) {
      navArgs.set({ phone: fullPhone, phoneLogin: true });
      router.push('/verification-code');
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
          title={t('login_with_phone_dsc')}
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
            hintText="09xxxxxxxx"
            validator={(value) => Validator.phoneNumberValid(value)}
            errorText={phoneError}
            prefixIcon={
              <View style={styles.dialCode}>
                <BaseText title={`+${countryCode.phoneCode}`} style={TextStyles.bodyMedium} />
              </View>
            }
          />
        </View>

        <View style={{ height: h(28) }} />

        <View style={{ alignSelf: 'stretch' }}>
          <LoadingButton loading={isLoading} onPress={onContinue}>
            <BaseText
              title={t('continue_label')}
              style={[TextStyles.headlineMedium, { color: AppColors.white }]}
            />
          </LoadingButton>
        </View>

        <View style={{ height: h(16) }} />
        <BaseText
          title={t('otp_will_be_sent')}
          style={[TextStyles.bodySmall, { color: AppColors.greyTextColorV3 }]}
          textAlign="center"
        />
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
});
