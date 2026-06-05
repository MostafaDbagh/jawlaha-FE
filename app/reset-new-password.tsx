// Ported from: lib/screens/auth/reset_new_password_screen.dart
// ResetNewPasswordScreen (StatefulWidget) -> expo-router screen.
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { TextStyles } from '@/theme';
import { t } from '@/i18n';
import { AppBar, BaseText, LoadingButton, AppTextField } from '@/components';
import { Validator } from '@/lib/validators';
// import { useRouter } from 'expo-router';
import { useAuthControllerStore } from '@/features/auth/authStore';

export default function ResetNewPasswordScreen() {
  // const router = useRouter();
  const isLoading = useAuthControllerStore((s) => s.isLoading);

  //=======================[Fields Controllers]==============
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    newPassword?: string | null;
    confirmPassword?: string | null;
  }>({});

  // double screenSize = MediaQuery.of(context).size.height;
  // double height = screenSize - kToolbarHeight - kBottomNavigationBarHeight;
  // -> the ScrollView fills the available height via minHeight:'100%' below.

  const validateForm = (): boolean => {
    const newPasswordErr = Validator.validatePasswordForPasswordModel(newPassword);
    const confirmPasswordErr = Validator.matchPassword(confirmPassword, newPassword);
    setErrors({ newPassword: newPasswordErr, confirmPassword: confirmPasswordErr });
    return !newPasswordErr && !confirmPasswordErr;
  };

  const onSave = async () => {
    if (!validateForm()) return;
    // final res = await authController.changePasswordViaCode(
    //     email: authController.state.emailForForgotPassword,
    //     code: authController.state.verifyCodeForRestPassword,
    //     confirmPassword:
    //         confirmPasswordTextEditingController.text,
    //     password: newPasswordTextEditingController.text);
    // if (res) {
    //   Navigator.pushAndRemoveUntil(
    //     context,
    //     MaterialPageRoute(
    //         builder: (context) => const LoginScreen()),
    //     (route) => false,
    //   );
    // }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AppBar title={t('forgot_password')} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={[
            styles.container,
            Responsive.getResponsivePadding(),
            // height: screenSize - kToolbarHeight - kBottomNavigationBarHeight
            { minHeight: '100%' },
          ]}
        >
          {/* Form */}
          <View style={styles.form}>
            <AppTextField
              label={`${t('new_password')} *`}
              value={newPassword}
              onChangeText={setNewPassword}
              borderStyleType="outlineInput"
              validator={(value) =>
                Validator.validatePasswordForPasswordModel(value ?? '')
              }
              errorText={errors.newPassword}
              obscureText
              hintText="*********"
            />
            <AppTextField
              label={t('confirm_password')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              borderStyleType="outlineInput"
              validator={(value) =>
                Validator.matchPassword(value ?? '', newPassword)
              }
              errorText={errors.confirmPassword}
              hintText="*********"
              obscureText
              keyboardType="default"
            />
          </View>
          <View style={{ height: Responsive.gapLarge }} />
          <LoadingButton loading={isLoading} onPress={onSave}>
            <BaseText
              title={t('save_new_password')}
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
    // mainAxisSize.max + center alignment
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    gap: Responsive.gapSmall,
  },
});
