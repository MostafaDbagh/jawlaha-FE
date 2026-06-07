// Order complaint screen ("الدعم والشكاوي"). The customer files a complaint
// about one of their orders — they pick the order's reference number, choose a
// category, and describe the problem. Submits to POST /complaints on jawlahapp.
// (Replaces the former Flutter ticket port, whose `tickets` endpoint the
// jawlahapp backend never implemented.)
import React, { useEffect, useCallback, useRef, useState } from 'react';
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
import { BaseText, AppTextField, LoadingButton, AppBar } from '@/components';
import { Validator } from '@/lib/validators';
import { showSnack } from '@/lib/snack';
import { navArgs, useNavArgs } from '@/store/navArgs';
import { useOrdersStore, type Order } from '@/features/orders/ordersStore';
import {
  useComplaintsStore,
  COMPLAINT_CATEGORIES,
} from '@/features/complaints/complaintsStore';

const shortRef = (orderId: string) => orderId.slice(0, 8);

function formatOrderDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SupportReportScreen() {
  const router = useRouter();

  const submitting = useComplaintsStore((s) => s.submitting);
  const submitComplaint = useComplaintsStore((s) => s.submitComplaint);
  const orders = useOrdersStore((s) => s.orders);

  // Selected order reference.
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderRefCode, setOrderRefCode] = useState<string>(''); // short code sent to API
  const [orderRefText, setOrderRefText] = useState<string>(''); // what the field shows

  // Complaint category + free text.
  const [category, setCategory] = useState('');
  const [categoryText, setCategoryText] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Bottom sheets.
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  // Field validators (mirrors the form-key pattern used across the app).
  const validators = useRef<Record<string, () => boolean>>({});
  const registerValidate = useCallback(
    (key: string) => (fn: () => boolean) => {
      validators.current[key] = fn;
    },
    [],
  );
  const validateForm = () => Object.values(validators.current).every((fn) => fn());

  // Load the user's orders for the reference picker, and pre-fill when arriving
  // from a specific order's "report a problem" action. navArgs is consumed once
  // and cleared so it can't stale-fill a later visit from the profile menu.
  const consumedArgs = useRef(false);
  useEffect(() => {
    useOrdersStore.getState().loadOrders();
    if (consumedArgs.current) return;
    consumedArgs.current = true;
    const args = useNavArgs.getState().args;
    const preId = args?.complaintOrderId as string | undefined;
    if (preId) {
      const ref = (args?.complaintOrderRef as string | undefined) || shortRef(preId);
      const vendor = (args?.complaintVendor as string | undefined) || '';
      selectOrder(preId, ref, vendor);
      navArgs.clear();
    }
  }, []);

  const selectOrder = (id: string, ref: string, vendor: string) => {
    setOrderId(id);
    setOrderRefCode(ref);
    setOrderRefText(vendor ? `#${ref} — ${vendor}` : `#${ref}`);
    setOrderSheetOpen(false);
  };

  const onSelectCategory = (value: string, label: string) => {
    setCategory(value);
    setCategoryText(label);
    setCategorySheetOpen(false);
  };

  const onSubmit = async () => {
    if (!validateForm()) return;
    const ok = await submitComplaint({
      category,
      subject: subject.trim() || categoryText,
      message: message.trim(),
      orderId,
      orderReference: orderRefCode,
    });
    if (ok) {
      showSnack(t('complaint_submitted'), 'success');
      router.back();
    }
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
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <View style={{ flex: 1, alignSelf: 'stretch' }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: Responsive.gapLarge }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ gap: Responsive.gapLarge }}>
                {/* Order reference number — opens the order picker */}
                <Pressable onPress={() => setOrderSheetOpen(true)}>
                  <View pointerEvents="none">
                    <AppTextField
                      label={t('order_reference_label')}
                      value={orderRefText}
                      onChangeText={() => {}}
                      borderStyleType="outlineInput"
                      validator={(value) => Validator.emptyText(value, 'order_reference_required')}
                      enabled={false}
                      suffixIcon={
                        <Ionicons
                          name="receipt-outline"
                          color={AppColors.hintColor}
                          size={Responsive.iconSmall}
                        />
                      }
                      hintText={t('select_order_hint')}
                      registerValidate={registerValidate('order')}
                    />
                  </View>
                </Pressable>

                {/* Complaint category — opens the category picker */}
                <Pressable onPress={() => setCategorySheetOpen(true)}>
                  <View pointerEvents="none">
                    <AppTextField
                      label={t('complaint_category_label')}
                      value={categoryText}
                      onChangeText={() => {}}
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
                      hintText={t('select_category_hint')}
                      registerValidate={registerValidate('category')}
                    />
                  </View>
                </Pressable>

                {/* Subject (optional) */}
                <AppTextField
                  label={`${t('complaint_subject_label')} ${t('optional_label')}`}
                  value={subject}
                  onChangeText={setSubject}
                  hintText={t('complaint_subject_hint')}
                  borderStyleType="outlineInput"
                />

                {/* Description */}
                <AppTextField
                  label={t('complaint_desc_label')}
                  value={message}
                  onChangeText={setMessage}
                  hintText={t('complaint_desc_hint')}
                  validator={(value) => Validator.emptyText(value)}
                  keyboardType="default"
                  borderStyleType="outlineInput"
                  maxLines={8}
                  registerValidate={registerValidate('message')}
                />
              </View>
            </ScrollView>
          </View>

          {/* Bottom buttons */}
          <View style={{ alignSelf: 'stretch', gap: Responsive.gapSmall }}>
            <LoadingButton loading={submitting} onPress={onSubmit}>
              <BaseText
                title={t('submit')}
                style={[TextStyles.headlineMedium, { color: AppColors.white }]}
              />
            </LoadingButton>
            <LoadingButton onPress={() => router.back()} color={AppColors.red}>
              <BaseText
                title={t('cancel')}
                style={[TextStyles.headlineMedium, { color: AppColors.white }]}
              />
            </LoadingButton>
          </View>
        </View>
      </View>

      {/* Order picker bottom sheet */}
      <Modal
        visible={orderSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setOrderSheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOrderSheetOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={{ height: h(28) }} />
            <View style={{ paddingHorizontal: w(26) }}>
              <BaseText
                title={t('select_order_title')}
                fontWeight="700"
                color={AppColors.primaryColorTheme}
                size={sp(16)}
              />
            </View>
            <View style={{ height: h(20) }} />
            <ScrollView style={{ maxHeight: h(360) }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 22 }}>
              {orders.length === 0 ? (
                <View style={{ paddingVertical: h(24), alignItems: 'center' }}>
                  <BaseText
                    title={t('no_orders_to_reference')}
                    size={sp(13)}
                    color={AppColors.textColor2}
                    textAlign="center"
                  />
                </View>
              ) : (
                orders.map((order: Order, index) => {
                  const ref = shortRef(order.order_id);
                  const isSelected = order.order_id === orderId;
                  return (
                    <React.Fragment key={order.order_id}>
                      {index > 0 ? (
                        <View style={{ paddingVertical: 7 }}>
                          <View style={styles.divider} />
                        </View>
                      ) : null}
                      <Pressable
                        onPress={() => selectOrder(order.order_id, ref, order.vendor_name ?? '')}
                        style={styles.orderRow}
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
                        <View style={{ width: 10 }} />
                        <View style={{ flex: 1, alignItems: 'flex-start' }}>
                          <BaseText
                            title={`#${ref}`}
                            size={sp(14)}
                            fontWeight="700"
                            color={AppColors.primaryColorTheme}
                          />
                          <BaseText
                            title={`${order.vendor_name ?? ''}${order.created_at ? ` · ${formatOrderDate(order.created_at)}` : ''}`}
                            size={sp(12)}
                            maxLines={1}
                            color={AppColors.textColor2}
                          />
                        </View>
                      </Pressable>
                    </React.Fragment>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Category picker bottom sheet */}
      <Modal
        visible={categorySheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCategorySheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setCategorySheetOpen(false)}>
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
              {COMPLAINT_CATEGORIES.map((value, index) => {
                const label = t(`complaint_category_${value}`);
                const isSelected = value === category;
                return (
                  <React.Fragment key={value}>
                    {index > 0 ? (
                      <View style={{ paddingVertical: 7 }}>
                        <View style={styles.divider} />
                      </View>
                    ) : null}
                    <Pressable
                      onPress={() => onSelectCategory(value, label)}
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
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
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
