// Ported from Flutter:
//   lib/screens/profile_screens/change_password_screen.dart (ChangePasswordScreen)
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppBar, AppTextField, BaseText, LoadingButton } from '@/components';
import { Validator } from '@/lib/validators';
import { useProfileStore } from '@/features/profile/profileStore';

export default function ChangePasswordScreen() {
  const router = useRouter();

  // TextEditingController(s) -> useState
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Form errors (mirrors GlobalKey<FormState>)
  const [errors, setErrors] = useState<{
    password?: string | null;
    newPassword?: string | null;
    confirmNewPassword?: string | null;
  }>({});

  const settingLoading = useProfileStore((s) => s.settingLoading);

  const responsivePadding = Responsive.getResponsivePadding();

  const validateForm = (): boolean => {
    const next = {
      password: Validator.emailValid(password),
      newPassword: Validator.validatePasswordForPasswordModel(newPassword ?? ''),
      confirmNewPassword: Validator.matchPassword(confirmNewPassword ?? '', newPassword),
    };
    setErrors(next);
    return !next.password && !next.newPassword && !next.confirmNewPassword;
  };

  const onSave = () => {
    if (!validateForm()) return;
    // Flutter onPressed: () {} — no-op
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AppBar title={t('change_password')} />
      <View
        style={[
          styles.body,
          {
            paddingHorizontal: responsivePadding.paddingHorizontal,
            paddingTop: Responsive.gapLarge,
            paddingBottom: Responsive.gapLarge,
          },
        ]}
      >
        {/* Form + SingleChildScrollView */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ gap: Responsive.gap }}>
            <AppTextField
              label={`${t('password')} *`}
              value={password}
              onChangeText={setPassword}
              borderStyleType="outlineInput"
              validator={(value) => Validator.emailValid(value)}
              errorText={errors.password}
              obscureText
              hintText="***********"
            />
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
              hintText="***********"
            />
            <AppTextField
              label={`${t('confirm_new_password')} *`}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              borderStyleType="outlineInput"
              validator={(value) =>
                Validator.matchPassword(value ?? '', newPassword)
              }
              errorText={errors.confirmNewPassword}
              obscureText
              hintText="***********"
            />
          </View>
        </ScrollView>

        <View style={{ gap: Responsive.gapSmall }}>
          <LoadingButton loading={settingLoading} onPress={onSave}>
            <BaseText
              title={t('save_changes')}
              style={[TextStyles.headlineMedium, { color: AppColors.white }]}
            />
          </LoadingButton>
          {/* CustomElevatedButton -> LoadingButton with red color */}
          <LoadingButton
            color={AppColors.red}
            onPress={() => {
              // Get.find<NavigationController>().handleBackPress();
              router.back();
            }}
          >
            <BaseText
              title={t('cancel')}
              style={[TextStyles.headlineMedium, { color: AppColors.white }]}
            />
          </LoadingButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
