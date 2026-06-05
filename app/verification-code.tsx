// Ported from: lib/screens/auth/verification_code_screen.dart (VerificationCodeScreen)
import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppColors, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import {
  AppImage,
  BaseText,
  TextButton,
  LoadingButton,
  AppBar,
} from '@/components';
import { Res } from '@/lib/assets';
import { useNavArgs } from '@/store/navArgs';
import { useAuthControllerStore } from '@/features/auth/authStore';

const kToolbarHeight = 56;
const kBottomNavigationBarHeight = 56;
const PIN_LENGTH = 4;

export default function VerificationCodeScreen() {
  const router = useRouter();

  // late final bool goToResetNewPassword;
  // initState: goToResetNewPassword = Get.arguments ?? false;
  const navArguments = useNavArgs((s) => s.args);
  const goToResetNewPassword: boolean =
    (navArguments?.goToResetNewPassword as boolean) ?? false;

  // String verifyCode = '';
  const [verifyCode, setVerifyCode] = useState('');

  // authController.state.isLoading.value
  const isLoading = useAuthControllerStore((s) => s.isLoading);
  const email = useAuthControllerStore((s) => s.email); // state.emailTextEditingController.text

  // double screenSize = MediaQuery.of(context).size.height;
  const screenSize = Dimensions.get('window').height;
  // double height = screenSize - kToolbarHeight - kBottomNavigationBarHeight;
  const height = screenSize - kToolbarHeight - kBottomNavigationBarHeight;

  // Ka4PinCodeField — simple pure-RN pin field.
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const fieldSize = Responsive.iconLarge * 2;

  const handleChange = (text: string, index: number) => {
    const value = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = next.join('');
    if (code.length === PIN_LENGTH && !next.includes('')) {
      // onCompleted: (code) { verifyCode = code; debugPrint("Verification Code: $code"); }
      setVerifyCode(code);
      // eslint-disable-next-line no-console
      console.log('Verification Code: ' + code);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onConfirm = async () => {
    if (goToResetNewPassword) {
      // final res =
      //     await authController.checkCodeForResetPassword(
      //         email:
      //             authController.state.emailForForgotPassword,
      //         code: verifyCode);
      // if (res) {
      //   Navigator.push(
      //     context,
      //     MaterialPageRoute(
      //         builder: (context) =>
      //             const ResetNewPasswordScreen()),
      //   );
      // }
    } else {
      const res = await useAuthControllerStore.getState().verifyCode({
        email: email,
        code: verifyCode,
      });
      void res;
      // if (res) {
      //   final registerRes = await authController.register();
      //   if (registerRes) {
      //     if (res) {
      //       Navigator.push(
      //         context,
      //         MaterialPageRoute(
      //             builder: (context) =>
      //                 const CreateAccountSuccessfullyScreen()),
      //       );
      //     }
      //   }
      // }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AppBar title={t('verification_code')} />
      <ScrollView>
        <View
          style={[
            styles.container,
            { height },
            Responsive.getResponsivePadding(),
          ]}
        >
          <BaseText
            title={t('sent_verification_code_email')}
            style={[TextStyles.bodyMedium, { color: AppColors.darkGray }]}
            textAlign="center"
          />

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
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, i)
                }
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.pinField,
                  {
                    width: fieldSize,
                    height: fieldSize,
                  },
                ]}
              />
            ))}
          </View>

          <View style={{ height: Responsive.gapLarge }} />

          <LoadingButton loading={isLoading} onPress={onConfirm}>
            <BaseText
              title={t('confirm')}
              style={[TextStyles.headlineMedium, { color: AppColors.white }]}
            />
          </LoadingButton>

          <View style={{ height: Responsive.gapLarge }} />

          <Pressable onPress={() => {}}>
            <View style={styles.resendRow}>
              <TextButton
                title={t('resend_code')}
                textStyle={[
                  TextStyles.headlineMedium,
                  { color: AppColors.lightBlue },
                ]}
              />
              <AppImage
                source={Res.appleIcon}
                style={{
                  height: Responsive.iconMedium,
                  width: Responsive.iconMedium,
                }}
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
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Responsive.gap,
  },
  pinField: {
    borderWidth: 1,
    borderColor: AppColors.darkGray,
    borderRadius: 10,
    backgroundColor: AppColors.white,
    textAlign: 'center',
    fontSize: 20,
    color: AppColors.textColorTheme,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Responsive.gapTiny,
  },
});
