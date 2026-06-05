// Ported from: lib/screens/auth/login_screen.dart
import React, { useState } from 'react';
import { View, ScrollView, Pressable, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppImage, BaseText, TextButton, LoadingButton, AppTextField } from '@/components';
import { Res } from '@/lib/assets';
import { Validator } from '@/lib/validators';
import { useAuthControllerStore } from '@/features/auth/authStore';

export default function LoginScreen() {
  const router = useRouter();

  //=======================[Fields Controllers]==============
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Form errors (mirrors GlobalKey<FormState> validate())
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null; phone?: string | null }>({});

  // ---- store state (mirrors authController.state.*) ----
  const isLoginWithPhone = useAuthControllerStore((s) => s.isLoginWithPhone);
  const isLoading = useAuthControllerStore((s) => s.isLoading);
  const countryCode = useAuthControllerStore((s) => s.countryCode);
  const setIsLoginWithPhone = useAuthControllerStore((s) => s.setIsLoginWithPhone);

  const screenHeight = Dimensions.get('window').height;

  function validateForm(): boolean {
    const next: typeof errors = {};
    if (isLoginWithPhone) {
      next.phone = Validator.phoneNumberValid(phoneNumber);
    } else {
      next.email = Validator.emailValid(email);
      next.password = Validator.emptyText(password);
    }
    setErrors(next);
    return Object.values(next).every((e) => e == null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.padding, Responsive.getResponsivePadding()]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              height: screenHeight,
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <AppImage
              source={Res.authLogo}
              style={{ height: h(40), width: w(120) }}
              contentFit="contain"
            />
            <View style={{ height: Responsive.gap }} />
            <BaseText title={t('welcome_back')} style={TextStyles.titleLarge} />
            <BaseText title={t('welcome_dsc')} style={TextStyles.bodyMedium} />
            <View style={{ height: Responsive.paddingLarge }} />

            {/* Form */}
            <View style={{ gap: Responsive.gap, alignSelf: 'stretch' }}>
              {/* AnimatedSwitcher: phone vs email */}
              {isLoginWithPhone ? loginWithPhone() : loginWithEmail()}

              <View style={styles.rowBetween}>
                <TextButton
                  onPress={() => {
                    setIsLoginWithPhone(!isLoginWithPhone);
                  }}
                  title={isLoginWithPhone ? t('login_with_email') : t('login_with_phone')}
                  textStyle={[
                    TextStyles.bodySmall,
                    {
                      textDecorationLine: 'underline',
                      color: AppColors.primaryColorTheme,
                      fontWeight: '700',
                    },
                  ]}
                />
                <TextButton
                  onPress={() => {
                    router.push('/forgot-password');
                  }}
                  title={`${t('forgot_password')}?`}
                  textStyle={[
                    TextStyles.bodySmall,
                    { color: AppColors.primaryColorTheme, fontWeight: '700' },
                  ]}
                />
              </View>
            </View>

            <View style={{ gap: Responsive.gapLarge, alignSelf: 'stretch' }}>
              <LoadingButton
                loading={isLoading}
                onPress={async () => {
                  if (!validateForm()) {
                    return;
                  }
                  // final res = await authController.loginRQ(
                  //     email: emailTextEditingController.text,
                  //     password: passwordTextEditingController.text,
                  //     payrollId: payrollAiIdTextEditingController.text);
                  // if (res) {
                  //   Navigator.pushAndRemoveUntil(
                  //     context,
                  //     MaterialPageRoute(
                  //         builder: (context) => const MainScreens()),
                  //     (route) => false,
                  //   );
                  // }
                }}
              >
                <BaseText
                  title={t('login')}
                  style={[TextStyles.headlineMedium, { color: AppColors.white }]}
                />
              </LoadingButton>

              <Pressable
                onPress={() => {
                  router.push('/create-account');
                }}
              >
                <View style={styles.rowCenter}>
                  <BaseText title={t('donot_have_account')} style={TextStyles.bodySmall} />
                  <TextButton
                    title={t('create_account')}
                    textStyle={[
                      TextStyles.bodySmall,
                      { color: AppColors.secondMainColor, fontWeight: 'bold' },
                    ]}
                  />
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );

  function loginWithEmail() {
    return (
      <View>
        <AppTextField
          label={t('email')}
          value={email}
          onChangeText={setEmail}
          borderStyleType="outlineInput"
          prefixIcon={<AppImage source={Res.emailIcon} style={{ height: r(24), width: r(24) }} />}
          validator={(value) => Validator.emailValid(value)}
          errorText={errors.email}
          hintText={t('enter_your_email')}
          keyboardType="email-address"
        />
        <View style={{ height: Responsive.gapTiny }} />
        <AppTextField
          label={t('password')}
          value={password}
          onChangeText={setPassword}
          prefixIcon={<AppImage source={Res.lockIcon} style={{ height: r(24), width: r(24) }} />}
          borderStyleType="outlineInput"
          validator={(value) => Validator.emptyText(value)}
          errorText={errors.password}
          obscureText
          hintText="***********"
        />
      </View>
    );
  }

  function loginWithPhone() {
    return (
      <AppTextField
        label={`${t('phone_number')} *`}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        borderStyleType="outlineInput"
        keyboardType="phone-pad"
        validator={(value) => Validator.phoneNumberValid(value)}
        errorText={errors.phone}
        // InitCountryCode (native country_pickers) -> simple RN fallback showing the phone code.
        prefixIcon={
          <View style={{ width: w(90), paddingHorizontal: w(10), justifyContent: 'center' }}>
            <BaseText title={`+${countryCode.phoneCode}`} style={TextStyles.bodySmall} />
          </View>
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  padding: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Responsive.gapTiny,
  },
});
