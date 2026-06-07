// Reset new password (phone flow). Reads phone + OTP from navArgs, sets a new
// password via auth/reset-password, then returns to login.
import React, { useState } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, sp, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppBar, BaseText, LoadingButton, AppTextField } from '@/components';
import { Validator } from '@/lib/validators';
import { showSnack } from '@/lib/snack';
import { useNavArgs } from '@/store/navArgs';
import { useAuthControllerStore } from '@/features/auth/authStore';

export default function ResetNewPasswordScreen() {
  const router = useRouter();
  const isLoading = useAuthControllerStore((s) => s.isLoading);

  const navArguments = useNavArgs((s) => s.args);
  const phone: string = (navArguments?.phone as string) ?? '';
  const otp: string = (navArguments?.otp as string) ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string | null;
    confirmPassword?: string | null;
  }>({});

  const validateForm = (): boolean => {
    const newPasswordErr = Validator.emptyText(newPassword, 'plz_enter_valid_password');
    const confirmPasswordErr = Validator.matchPassword(newPassword, confirmPassword);
    setErrors({ newPassword: newPasswordErr, confirmPassword: confirmPasswordErr });
    return !newPasswordErr && !confirmPasswordErr;
  };

  const onSave = async () => {
    if (!validateForm()) return;
    const ok = await useAuthControllerStore.getState().resetPasswordPhone({
      phone,
      otp,
      newPassword,
    });
    if (ok) {
      showSnack(t('password_reset_success'), 'success');
      router.replace('/login');
    }
  };

  const eyeIcon = (visible: boolean, toggle: () => void) => (
    <Pressable onPress={toggle} hitSlop={8}>
      <Ionicons
        name={visible ? 'eye-off-outline' : 'eye-outline'}
        size={sp(20)}
        color={AppColors.hintColor}
      />
    </Pressable>
  );

  const lockIcon = (
    <Ionicons name="lock-closed-outline" size={sp(20)} color={AppColors.hintColor} />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AppBar title={t('reset_password')} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={[
            styles.container,
            Responsive.getResponsivePadding(),
            { minHeight: '100%' },
          ]}
        >
          <BaseText
            title={t('reset_password_desc')}
            style={[TextStyles.bodyMedium, { color: AppColors.darkGray }]}
            textAlign="center"
          />
          <View style={{ height: Responsive.gapLarge }} />

          {/* Form */}
          <View style={styles.form}>
            <AppTextField
              label={`${t('new_password')} *`}
              value={newPassword}
              onChangeText={setNewPassword}
              borderStyleType="outlineInput"
              obscureText={!showPassword}
              hintText={t('enter_your_password')}
              validator={(v) => Validator.emptyText(v, 'plz_enter_valid_password')}
              errorText={errors.newPassword}
              prefixIcon={lockIcon}
              suffixIcon={eyeIcon(showPassword, () => setShowPassword((v) => !v))}
            />
            <AppTextField
              label={t('confirm_password')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              borderStyleType="outlineInput"
              obscureText={!showConfirm}
              hintText={t('confirm_your_password')}
              validator={(v) => Validator.matchPassword(newPassword, v ?? '')}
              errorText={errors.confirmPassword}
              prefixIcon={lockIcon}
              suffixIcon={eyeIcon(showConfirm, () => setShowConfirm((v) => !v))}
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    gap: Responsive.gapSmall,
  },
});
