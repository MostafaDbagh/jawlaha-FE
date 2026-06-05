// Ported from Flutter:
//   lib/screens/profile_screens/support_report_screen.dart (SupportReportScreen)
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp, TextStyles } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { t } from '@/i18n';
import {
  AppImage,
  BaseText,
  AppTextField,
  LoadingButton,
  AppBar,
} from '@/components';
import { Res } from '@/lib/assets';
import { Validator } from '@/lib/validators';
import { useProfileStore } from '@/features/profile/profileStore';

// Mirrors core/enums/ticket_issue_type.dart (TicketIssueType.values -> getTitle())
const ticketIssueValues = [
  'technical_issue',
  'design_issue',
  'login_issue',
  'device_compatibility_issue',
  'data_privacy_concern',
  'notification_issue',
  'other',
];
const ticketIssueLabels = [
  'Technical Issue',
  'Design Issue',
  'Login Issue',
  'Device Compatibility Issue',
  'Data Privacy Concern',
  'Notification Issue',
  'Other',
];

export default function SupportReportScreen() {
  const router = useRouter();

  // controller = Get.find<ProfileController>()
  const settingLoading = useProfileStore((s) => s.settingLoading);
  const submitSupportReport = useProfileStore((s) => s.submitSupportReport);
  const clearTicketState = useProfileStore((s) => s.clearTicketState);
  const getMyTickets = useProfileStore((s) => s.getMyTickets);
  const pickFile = useProfileStore((s) => s.pickFile);

  // TextEditingControllers -> useState
  const [issueType, setIssueType] = useState('');
  const [issueText, setIssueText] = useState(''); // issueTextEditingController
  const [dscText, setDscText] = useState(''); // dscTextEditingController
  const [fileText, setFileText] = useState(''); // fileTextEditingController

  // Form key -> registered field validators
  const validators = useRef<Record<string, () => boolean>>({});
  const registerValidate = useCallback(
    (key: string) => (fn: () => boolean) => {
      validators.current[key] = fn;
    },
    [],
  );
  const validateForm = () =>
    Object.values(validators.current).every((fn) => fn());

  // select_item_bottom_sheet (openSelectItemBottomSheet) -> simple RN Modal
  const [sheetOpen, setSheetOpen] = useState(false);

  const onSelectIssue = (item: string, label: string) => {
    setIssueType(item);
    setIssueText(label);
    setSheetOpen(false); // Navigator.pop(context)
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: AppColors.backgroundColor }}
      edges={['top', 'bottom']}
    >
      <AppBar title={t('support_report')} />
      <View
        style={[
          Responsive.getResponsivePadding(),
          { flex: 1, paddingTop: Responsive.gapLarge, paddingBottom: Responsive.gapLarge },
        ]}
      >
        {/* Column(crossAxisAlignment: start) */}
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          {/* Expanded -> SingleChildScrollView */}
          <View style={{ flex: 1, alignSelf: 'stretch' }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: Responsive.gapLarge }}
            >
              {/* Form */}
              <View style={{ gap: Responsive.gapLarge }}>
                {/* CustomInkWell -> opens select item bottom sheet */}
                <Pressable onPress={() => setSheetOpen(true)}>
                  <View pointerEvents="none">
                    <AppTextField
                      label={t('about')}
                      value={issueText}
                      onChangeText={setIssueText}
                      borderStyleType="outlineInput"
                      validator={(value) => Validator.emptyText(value)}
                      enabled={false}
                      suffixIcon={
                        <Ionicons
                          name="caret-down"
                          color={AppColors.hintColor}
                          size={Responsive.iconSmall}
                        />
                      }
                      hintText={t('about')}
                      registerValidate={registerValidate('issue')}
                    />
                  </View>
                </Pressable>

                <AppTextField
                  label={t('about')}
                  value={dscText}
                  onChangeText={setDscText}
                  hintText={t('about')}
                  validator={(value) => Validator.emptyText(value)}
                  keyboardType="default"
                  borderStyleType="outlineInput"
                  maxLines={10}
                  registerValidate={registerValidate('dsc')}
                />
              </View>

              {/* CustomInkWell -> pickFile (optional) */}
              <Pressable
                onPress={async () => {
                  const res = await pickFile();
                  if (res != null) {
                    // fileTextEditingController.text = res.files.single.name;
                    setFileText((res as any)?.name ?? '');
                  }
                }}
              >
                <View pointerEvents="none">
                  <AppTextField
                    label={`${t('about')} (Optional)`}
                    enabled={false}
                    value={fileText}
                    onChangeText={setFileText}
                    validator={(value) => Validator.emptyText(value)}
                    borderStyleType="outlineInput"
                    suffixIcon={
                      <AppImage
                        source={Res.appleIcon}
                        style={{
                          height: Responsive.iconSmall,
                          width: Responsive.iconSmall,
                        }}
                      />
                    }
                    hintText={t('about')}
                  />
                </View>
              </Pressable>
            </ScrollView>
          </View>

          {/* Bottom buttons column */}
          <View style={{ alignSelf: 'stretch', gap: Responsive.gapSmall }}>
            <LoadingButton
              loading={settingLoading}
              onPress={async () => {
                if (!validateForm()) {
                  return;
                }
                const res = await submitSupportReport({
                  issueType: issueType,
                  message: dscText,
                });
                if (res) {
                  clearTicketState();
                  getMyTickets();
                  router.back(); // Get.find<NavigationController>().handleBackPress()
                }
              }}
            >
              <BaseText
                title={t('submit')}
                style={[TextStyles.headlineMedium, { color: AppColors.white }]}
              />
            </LoadingButton>

            <LoadingButton
              onPress={() => {
                router.back(); // handleBackPress()
              }}
              color={AppColors.red}
            >
              <BaseText
                title={t('cancel')}
                style={[TextStyles.headlineMedium, { color: AppColors.white }]}
              />
            </LoadingButton>
          </View>
        </View>
      </View>

      {/* SelectItemBottomSheet (showKaBottomSheet) -> RN Modal */}
      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={{ height: h(28) }} />
            <View style={{ paddingHorizontal: w(26) }}>
              <BaseText
                title={t('select_item')}
                fontWeight="700"
                color={AppColors.primaryColorTheme}
                size={sp(16)}
              />
            </View>
            <View style={{ height: h(32) }} />
            <View style={{ paddingHorizontal: 24 }}>
              {ticketIssueLabels.map((label, index) => {
                const value = ticketIssueValues[index];
                const isSelected = value === issueType;
                return (
                  <React.Fragment key={value}>
                    {index > 0 ? (
                      <View style={{ paddingVertical: 7 }}>
                        <View style={styles.divider} />
                      </View>
                    ) : null}
                    <Pressable
                      onPress={() => {
                        if (!isSelected) onSelectIssue(value, label);
                      }}
                      style={styles.itemRow}
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          {
                            borderColor: isSelected
                              ? AppColors.primaryColorTheme
                              : AppColors.borderColor,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.radioInner,
                            {
                              backgroundColor: isSelected
                                ? AppColors.primaryColorTheme
                                : AppColors.transparent,
                            },
                          ]}
                        />
                      </View>
                      <View style={{ width: 8 }} />
                      <BaseText
                        title={label}
                        size={13}
                        maxLines={1}
                        color={AppColors.primaryColorTheme}
                      />
                    </Pressable>
                  </React.Fragment>
                );
              })}
            </View>
            <View style={{ height: 22 }} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: r(16),
    borderTopRightRadius: r(16),
  },
  divider: {
    height: 0.5,
    backgroundColor: AppColors.borderColor,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 1,
    padding: Responsive.paddingTiny,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 8,
  },
});
