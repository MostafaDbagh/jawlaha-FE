// Ported from: lib/screens/auth/create_account_screen.dart
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardTypeOptions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppColors, sp, TextStyles } from '@/theme';
import { quicksand } from '@/theme/typography';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import { AppImage, BaseText, LoadingButton, AppTextField } from '@/components';
import { Res } from '@/lib/assets';
import { Validator } from '@/lib/validators';

import {
  useAuthControllerStore,
  GenderType,
} from '@/features/auth/authStore';

// Mirrors GenderType.getValues() / getTitles() (core/enums/gender_type.dart)
const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: GenderType.male, label: t('male') },
  { value: GenderType.female, label: t('female') },
  { value: GenderType.preferNotSay, label: t('prefer_not_say') },
];

export default function CreateAccountScreen() {
  const router = useRouter();

  // authController.state.* fields -> store state + setters
  const isLoading = useAuthControllerStore((s) => s.isLoading);
  const fullName = useAuthControllerStore((s) => s.fullName);
  const phoneNumber = useAuthControllerStore((s) => s.phoneNumber);
  const gender = useAuthControllerStore((s) => s.gender);
  const email = useAuthControllerStore((s) => s.email);
  const password = useAuthControllerStore((s) => s.password);
  const confirmPassword = useAuthControllerStore((s) => s.confirmPassword);
  const countryCode = useAuthControllerStore((s) => s.countryCode);

  const setFullName = useAuthControllerStore((s) => s.setFullName);
  const setPhoneNumber = useAuthControllerStore((s) => s.setPhoneNumber);
  const setGender = useAuthControllerStore((s) => s.setGender);
  const setGenderType = useAuthControllerStore((s) => s.setGenderType);
  const setEmail = useAuthControllerStore((s) => s.setEmail);
  const setPassword = useAuthControllerStore((s) => s.setPassword);
  const setConfirmPassword = useAuthControllerStore((s) => s.setConfirmPassword);
  const setCountryCode = useAuthControllerStore((s) => s.setCountryCode);

  // GlobalKey<FormState> _formKey -> local errors map + validate-on-submit
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [genderSheetOpen, setGenderSheetOpen] = useState(false);

  const validate = (): boolean => {
    const next: Record<string, string | null> = {
      fullName: Validator.emptyText(fullName),
      phoneNumber: Validator.phoneNumberValid(phoneNumber),
      gender: Validator.emptyText(gender),
      // NOTE: the Dart source renders the email field twice; we keep a single
      // email model so both share the same value/validator faithfully.
      email: Validator.emailValid(email),
      // Validator.validatePasswordForPasswordModel just checks the password is
      // non-empty for the password model -> emptyText.
      password: Validator.emptyText(password),
      confirmPassword: Validator.matchPassword(confirmPassword, password),
    };
    setErrors(next);
    return Object.values(next).every((e) => e == null);
  };

  // Mirrors openSelectItemBottomSheet<GenderType>(...)
  const openGenderSheet = () => {
    // final GenderType type = GenderType.male;
    setGenderSheetOpen(true);
  };

  const selectGender = (item: { value: GenderType; label: string }) => {
    setGenderType(item.value);
    setGender(item.label);
    setGenderSheetOpen(false);
  };

  const onCreateAccount = async () => {
    if (!validate()) {
      return;
    }
    await useAuthControllerStore.getState().getNewCode({ email });
    router.push('/verification-code' as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          Responsive.getResponsivePadding(),
          { gap: Responsive.gapLarge },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form */}
        <View style={{ gap: Responsive.gapSmall }}>
          <BaseText
            title={t('jawlah')}
            style={[
              TextStyles.displayMedium,
              { color: AppColors.primaryColorTheme, fontFamily: quicksand('500') },
            ]}
          />
          <View style={{ height: Responsive.gapLarge * 2 }} />
          <BaseText
            title={t('create_account')}
            style={[
              TextStyles.headlineMedium,
              { color: AppColors.primaryColorTheme, fontFamily: quicksand('500') },
            ]}
          />
          <View style={{ height: Responsive.gapLarge }} />

          {/* Full name */}
          <AppTextField
            prefixIcon={
              <AppImage source={Res.profileIcon} width={24} height={24} />
            }
            label={t('full_name')}
            value={fullName}
            onChangeText={setFullName}
            borderStyleType="outlineInput"
            keyboardType={'name-phone-pad' as KeyboardTypeOptions}
            validator={(v) => Validator.emptyText(v)}
            errorText={errors.fullName}
            hintText={t('last_name')}
          />

          {/* Phone number */}
          <AppTextField
            label={t('phone_number')}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            borderStyleType="outlineInput"
            keyboardType="phone-pad"
            validator={(v) => Validator.phoneNumberValid(v)}
            errorText={errors.phoneNumber}
            prefixIcon={
              // InitCountryCode (showFlag:false, needNumber:true) ->
              // simple non-native country-code chip showing the dial code.
              <Pressable
                onPress={() => {
                  // onValuePicked / onSelectedCountry -> update countryCode.
                  // TODO: country picker (native country_pickers not used in RN).
                  setCountryCode(countryCode);
                }}
                style={styles.countryCode}
              >
                <BaseText
                  title={`+${countryCode.phoneCode}`}
                  color={AppColors.textColorTheme}
                  size={sp(14)}
                />
              </Pressable>
            }
          />

          {/* Gender */}
          <Pressable onPress={openGenderSheet}>
            <View pointerEvents="none">
              <AppTextField
                prefixIcon={
                  <AppImage source={Res.genderIcon} width={24} height={24} />
                }
                label={t('gender')}
                enabled={false}
                value={gender}
                onChangeText={setGender}
                borderStyleType="outlineInput"
                validator={(v) => Validator.emptyText(v)}
                errorText={errors.gender}
                hintText={t('select_gender')}
              />
            </View>
          </Pressable>

          {/* Email */}
          <AppTextField
            prefixIcon={
              <AppImage source={Res.emailIcon} width={24} height={24} />
            }
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            borderStyleType="outlineInput"
            keyboardType="email-address"
            validator={(v) => Validator.emailValid(v)}
            errorText={errors.email}
            hintText="example@email.com"
          />

          {/* Email (duplicated in the Flutter source — kept faithfully) */}
          <AppTextField
            prefixIcon={
              <AppImage source={Res.emailIcon} width={24} height={24} />
            }
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            borderStyleType="outlineInput"
            keyboardType="email-address"
            validator={(v) => Validator.emailValid(v)}
            errorText={errors.email}
            hintText="example@email.com"
          />

          {/* Password */}
          <AppTextField
            prefixIcon={
              <AppImage source={Res.lockIcon} width={24} height={24} />
            }
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            borderStyleType="outlineInput"
            validator={(v) => Validator.emptyText(v ?? '')}
            errorText={errors.password}
            obscureText
            hintText="***********"
          />

          {/* Confirm password */}
          <AppTextField
            prefixIcon={
              <AppImage source={Res.lockIcon} width={24} height={24} />
            }
            label={t('confirm_password')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            borderStyleType="outlineInput"
            validator={(v) => Validator.matchPassword(v ?? '', password)}
            errorText={errors.confirmPassword}
            obscureText
            hintText="***********"
          />
        </View>

        {/* Buttons */}
        <View style={{ gap: Responsive.gap }}>
          <LoadingButton loading={isLoading} onPress={onCreateAccount}>
            <BaseText
              title={t('create_account')}
              style={[TextStyles.headlineMedium, { color: AppColors.white }]}
            />
          </LoadingButton>

          {/* CustomElevatedButton(onPressed: Get.back, color: darkGray) */}
          <LoadingButton color={AppColors.darkGray} onPress={() => router.back()}>
            <BaseText
              title={t('back')}
              style={[TextStyles.headlineMedium, { color: AppColors.white }]}
            />
          </LoadingButton>
        </View>
      </ScrollView>

      {/* openSelectItemBottomSheet<GenderType> fallback (simple RN modal) */}
      <Modal
        visible={genderSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setGenderSheetOpen(false)}
      >
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => setGenderSheetOpen(false)}
        >
          <Pressable style={styles.sheet}>
            <BaseText
              title={t('select_gender')}
              style={[TextStyles.titleLarge, { marginBottom: Responsive.gap }]}
            />
            {GENDER_OPTIONS.map((item) => (
              <Pressable
                key={item.value}
                style={styles.sheetItem}
                onPress={() => selectGender(item)}
              >
                <BaseText title={item.label} size={sp(16)} />
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.backgroundColor,
  },
  countryCode: {
    width: 90,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: Responsive.padding,
    paddingVertical: Responsive.gapLarge,
  },
  sheetItem: {
    paddingVertical: Responsive.gapSmall,
  },
});
