// Ported from: lib/screens/auth/forgot_password_screen.dart
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { screenHeight } from '@/theme/scale';
import { t } from '@/i18n';
import { AppBar, BaseText, AppTextField, LoadingButton } from '@/components';
import { Validator } from '@/lib/validators';
import { useAuthControllerStore } from '@/features/auth/authStore';
// import { useRouter } from 'expo-router';

// Flutter toolbar / bottom-nav heights (kToolbarHeight / kBottomNavigationBarHeight)
const kToolbarHeight = 56;
const kBottomNavigationBarHeight = 56;

export default function ForgotPasswordScreen() {
  // final AuthController authController = Get.find();
  const isLoading = useAuthControllerStore((s) => s.isLoading);
  // const router = useRouter();

  //=======================[Fields Controllers]==============
  // final TextEditingController payrollAiIdTextEditingController = ...
  const [payrollAiId, setPayrollAiId] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // double screenSize = MediaQuery.of(context).size.height;
  const screenSize = screenHeight;
  // double height = screenSize - kToolbarHeight - kBottomNavigationBarHeight;
  const height = screenSize - kToolbarHeight - kBottomNavigationBarHeight;

  const validateForm = (): boolean => {
    const err = Validator.emailValid(email);
    setEmailError(err);
    return err == null;
  };

  const onSend = () => {
    if (!validateForm()) {
      return;
    }
    // final res = await controller.resetPasswordViaEmail(
    //     email: emailTextEditingController.text,
    //     customId: payrollAiIdTextEditingController.text);
    // if (res) {
    //   Navigator.push(
    //     context,
    //     MaterialPageRoute(
    //         builder: (context) =>
    //             const VerificationCodeScreen()),
    //   );
    // }
    // (payrollAiId is collected but the call is commented out in the Flutter source)
    void payrollAiId;
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
            title={t('forgot_password')}
            style={[TextStyles.bodyMedium, { color: AppColors.darkGray }]}
            textAlign="center"
          />
          <View style={{ height: Responsive.gap }} />
          {/* Form */}
          <View style={{ gap: Responsive.gapSmall, width: '100%' }}>
            <AppTextField
              label={t('your_email')}
              value={email}
              onChangeText={setEmail}
              borderStyleType="outlineInput"
              errorText={emailError}
              validator={(value) => Validator.emailValid(value)}
              hintText={t('enter_your_email')}
              keyboardType="email-address"
            />
          </View>
          <View style={{ height: Responsive.gapLarge }} />
          <LoadingButton loading={isLoading} onPress={onSend}>
            <BaseText
              title={t('send_otp')}
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
});
