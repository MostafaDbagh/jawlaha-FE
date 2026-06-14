// Jawlaha Box — errand / personal-courier creation screen.
//
// The customer asks a driver to BUY or PICK UP free-text things from NON-
// restaurant places (grocery, pharmacy, keys from an office) and deliver them,
// cash on delivery. The driver fronts the purchase cash and is reimbursed on
// delivery: final cash = actual purchases + service fee. This is NOT a
// restaurant order — there's no menu/product, just descriptions + pickup stops.
//
// Pricing & limits come from GET /orders/box/config (admin-set, city-scoped).
// The client shows a LIVE estimated service fee but never sets it — the server
// resolves the real fee on POST /orders/box and enforces every limit.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { QuicksandFamily } from '@/theme/typography';
import { t, useI18n } from '@/i18n';
import { BaseText } from '@/components';
import { showSnack } from '@/lib/snack';
import { goBack } from '@/lib/nav';
import { formatPrice } from '@/lib/currency';
import { requireAuth } from '@/lib/authGuard';
import { navArgs } from '@/store/navArgs';
import { ordersRepo, type BoxConfig } from '@/data/repository/orders';
import { useCityStore } from '@/features/location/cityStore';
import { useLocationPicker } from '@/features/addresses/locationPicker';
import { cityCenter, type LatLng } from '@/lib/cities';

const RETURN_ROUTE = '/jawlaha-box';
const DESTINATION_TARGET = 'destination';

// Category chips (value sent to the backend = the stable english key).
const CATEGORIES = [
  { key: 'grocery', label: 'box_category_grocery' },
  { key: 'cleaning', label: 'box_category_cleaning' },
  { key: 'pharmacy', label: 'box_category_pharmacy' },
  { key: 'documents', label: 'box_category_documents' },
  { key: 'other', label: 'box_category_other' },
] as const;

interface ItemForm {
  id: string;
  description: string;
  qty: number;
  category: string | null;
  note: string;
  stopId: string; // which stop this item is bought from (stable id)
}

interface StopForm {
  id: string;
  place_name: string;
  address: string;
  note: string;
  coords: LatLng | null;
}

let counter = 0;
const nextId = () => `${Date.now()}-${counter++}`;

export default function JawlahaBoxScreen() {
  const router = useRouter();
  const { isRTL } = useI18n();
  const city = useCityStore((s) => s.city);
  // Backend stores/filters city in ENGLISH (see cities.ts); send that form.
  const cityParam = city?.en ?? null;

  const [config, setConfig] = useState<BoxConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const [stops, setStops] = useState<StopForm[]>([
    { id: nextId(), place_name: '', address: '', note: '', coords: null },
  ]);
  const [items, setItems] = useState<ItemForm[]>([]);
  const [budget, setBudget] = useState('');
  const [instructions, setInstructions] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const [destCoords, setDestCoords] = useState<LatLng | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stopPickerFor, setStopPickerFor] = useState<string | null>(null);

  // Seed the first item so the form isn't empty on open.
  useEffect(() => {
    setItems([
      { id: nextId(), description: '', qty: 1, category: null, note: '', stopId: stops[0].id },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load pricing + limits whenever the city changes (the fee is city-scoped).
  useEffect(() => {
    let alive = true;
    (async () => {
      setConfigLoading(true);
      const res = await ordersRepo.getBoxConfig(cityParam);
      if (!alive) return;
      if (res.success && res.object) setConfig(res.object as BoxConfig);
      else showSnack(res.msg || t('couldnt_load'), 'error');
      setConfigLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [cityParam]);

  // Pick up a confirmed map pin when we return from /pick-location. The picker
  // is shared, so `target` tells us which pin (a stop id, or the destination).
  useFocusEffect(
    useCallback(() => {
      const picker = useLocationPicker.getState();
      if (picker.result && picker.returnTo === RETURN_ROUTE) {
        const coords = picker.result;
        const target = picker.target;
        if (target === DESTINATION_TARGET) {
          setDestCoords(coords);
        } else if (target) {
          setStops((prev) => prev.map((s) => (s.id === target ? { ...s, coords } : s)));
        }
        picker.clearResult();
      }
    }, []),
  );

  const maxItems = config?.max_items ?? 5;
  const maxStops = config?.max_stops ?? 3;
  const includedItems = config?.included_items ?? 3;
  const maxBudget = config?.max_budget ?? 0;

  // Live estimated service fee (server resolves the authoritative one):
  // base + extra-item fee × items over included + extra-stop fee × stops over 1.
  const fee = useMemo(() => {
    if (!config) return null;
    const itemCount = items.length;
    const stopCount = stops.length;
    const extraItems = Math.max(0, itemCount - config.included_items);
    const extraStops = Math.max(0, stopCount - 1);
    const extraItemsFee = extraItems * config.extra_item_fee;
    const extraStopsFee = extraStops * config.extra_stop_fee;
    return {
      base: config.base_fee,
      extraItems,
      extraItemsFee,
      extraStops,
      extraStopsFee,
      total: config.base_fee + extraItemsFee + extraStopsFee,
    };
  }, [config, items.length, stops.length]);

  // ----------------------------- Items -----------------------------
  const addItem = () => {
    if (items.length >= maxItems) {
      showSnack(t('box_max_items_reached', { max: maxItems }), 'info');
      return;
    }
    setItems((prev) => [
      ...prev,
      { id: nextId(), description: '', qty: 1, category: null, note: '', stopId: stops[0].id },
    ]);
  };
  const removeItem = (id: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  const patchItem = (id: string, patch: Partial<ItemForm>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  // ----------------------------- Stops -----------------------------
  const addStop = () => {
    if (stops.length >= maxStops) {
      showSnack(t('box_max_stops_reached', { max: maxStops }), 'info');
      return;
    }
    setStops((prev) => [
      ...prev,
      { id: nextId(), place_name: '', address: '', note: '', coords: null },
    ]);
  };
  const removeStop = (id: string) => {
    if (stops.length <= 1) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
    // Re-home any items that pointed at the removed stop to the first stop.
    setItems((prev) =>
      prev.map((i) => (i.stopId === id ? { ...i, stopId: stops[0].id } : i)),
    );
  };
  const patchStop = (id: string, patch: Partial<StopForm>) =>
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // Open the shared OSM/Leaflet picker, tagging which pin we expect back.
  const openMapPicker = (target: string, current: LatLng | null) => {
    useLocationPicker
      .getState()
      .open(current ?? cityCenter(city), { returnTo: RETURN_ROUTE, target });
    router.push('/pick-location');
  };

  // ----------------------------- Submit -----------------------------
  const onSubmit = async () => {
    if (!requireAuth(router)) return;
    if (!config) return;

    // Items: at least one, each with a description.
    if (items.length === 0) {
      showSnack(t('box_no_items'), 'info');
      return;
    }
    if (items.some((i) => !i.description.trim())) {
      showSnack(t('box_item_description_required'), 'info');
      return;
    }
    // Stops: every pickup place needs a name.
    if (stops.some((s) => !s.place_name.trim())) {
      showSnack(t('box_stop_name_required'), 'info');
      return;
    }
    // Destination address required (a pin alone isn't a human-readable address).
    if (!destAddress.trim()) {
      showSnack(t('box_destination_required'), 'info');
      return;
    }
    // Budget cap required + within the admin max.
    const budgetNum = Number(budget);
    if (!budget.trim() || !Number.isFinite(budgetNum) || budgetNum <= 0) {
      showSnack(t('box_budget_required'), 'info');
      return;
    }
    if (maxBudget > 0 && budgetNum > maxBudget) {
      showSnack(t('box_budget_too_high', { max: formatPrice(maxBudget) }), 'info');
      return;
    }
    if (!accepted) {
      showSnack(t('box_disclaimer_required'), 'info');
      return;
    }

    // Map stable stop ids -> the index the backend expects on each item.
    const stopIndexById = new Map(stops.map((s, idx) => [s.id, idx]));

    setSubmitting(true);
    const res = await ordersRepo.createBoxOrder({
      stops: stops.map((s) => ({
        place_name: s.place_name.trim(),
        address: s.address.trim() || undefined,
        lat: s.coords?.lat,
        lng: s.coords?.lng,
        note: s.note.trim() || undefined,
      })),
      items: items.map((i) => ({
        description: i.description.trim(),
        qty: i.qty,
        category: i.category ?? undefined,
        note: i.note.trim() || undefined,
        stop_index: stopIndexById.get(i.stopId) ?? 0,
      })),
      budget_cap: budgetNum,
      instructions: instructions.trim() || undefined,
      city: cityParam,
      delivery_address: destAddress.trim(),
      delivery_lat: destCoords?.lat,
      delivery_lng: destCoords?.lng,
    });
    setSubmitting(false);

    if (res.success && res.object) {
      const order = res.object as { order_id: string };
      showSnack(t('box_order_placed'), 'success');
      navArgs.set({ orderId: order.order_id });
      router.replace('/tracking-order');
      return;
    }
    // 409 (a pickup matches a listed restaurant) and 400 (limit/budget/missing
    // destination) both carry the server message — surface it verbatim.
    showSnack(res.msg || t('couldnt_load'), 'error');
  };

  const backIcon = isRTL ? 'arrow-forward' : 'arrow-back';
  const stopLabel = (id: string) => {
    const idx = stops.findIndex((s) => s.id === id);
    const s = stops[idx];
    return s?.place_name.trim() || t('box_stop_label', { num: idx + 1 });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable onPress={() => goBack(router, '/(tabs)')} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name={backIcon as any} size={sp(24)} color={AppColors.textColorTheme} />
        </Pressable>
        <BaseText title={t('box_title')} size={sp(18)} fontWeight="bold" color={AppColors.textColorTheme} />
        <View style={styles.iconBtn} />
      </View>
      <View style={styles.divider} />

      {configLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={AppColors.primaryColor} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: w(16), paddingBottom: h(24) }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro */}
          <View style={styles.introCard}>
            <MaterialIcons name="inventory-2" size={sp(22)} color={AppColors.primaryColor} />
            <View style={{ width: w(10) }} />
            <View style={{ flex: 1 }}>
              <BaseText title={t('box_intro')} size={sp(13)} color={AppColors.textColor2} />
            </View>
          </View>

          {/* ---- Items ---- */}
          <SectionTitle title={t('box_items_section')} hint={t('box_items_hint')} />
          {items.map((item, idx) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <BaseText
                  title={`${t('box_item_description_label')} ${idx + 1}`}
                  size={sp(14)}
                  fontWeight="bold"
                  color={AppColors.textColorTheme}
                />
                {items.length > 1 && (
                  <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
                    <BaseText title={t('box_remove_item')} size={sp(13)} color={AppColors.red} />
                  </Pressable>
                )}
              </View>
              <TextInput
                value={item.description}
                onChangeText={(v) => patchItem(item.id, { description: v })}
                placeholder={t('box_item_description_hint')}
                placeholderTextColor={AppColors.textColor2}
                style={styles.input}
              />
              <View style={{ height: h(10) }} />
              {/* Qty stepper + category */}
              <View style={styles.row}>
                <BaseText title={t('box_qty_label')} size={sp(13)} color={AppColors.textColor2} />
                <View style={{ width: w(10) }} />
                <Stepper
                  value={item.qty}
                  onDec={() => patchItem(item.id, { qty: Math.max(1, item.qty - 1) })}
                  onInc={() => patchItem(item.id, { qty: item.qty + 1 })}
                />
              </View>
              <View style={{ height: h(10) }} />
              <View style={styles.chipsRow}>
                {CATEGORIES.map((c) => {
                  const on = item.category === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      onPress={() => patchItem(item.id, { category: on ? null : c.key })}
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <BaseText
                        title={t(c.label)}
                        size={sp(12)}
                        color={on ? AppColors.white : AppColors.textColor2}
                      />
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ height: h(10) }} />
              <TextInput
                value={item.note}
                onChangeText={(v) => patchItem(item.id, { note: v })}
                placeholder={t('box_item_note_hint')}
                placeholderTextColor={AppColors.textColor2}
                style={styles.input}
              />
              {/* Which place this item comes from (only when >1 stop) */}
              {stops.length > 1 && (
                <>
                  <View style={{ height: h(10) }} />
                  <Pressable
                    style={styles.fromStopRow}
                    onPress={() => setStopPickerFor(item.id)}
                  >
                    <MaterialIcons name="storefront" size={sp(18)} color={AppColors.primaryColor} />
                    <View style={{ width: w(8) }} />
                    <BaseText
                      title={`${t('box_item_from_stop')}: ${stopLabel(item.stopId)}`}
                      size={sp(13)}
                      color={AppColors.textColorTheme}
                    />
                    <View style={{ flex: 1 }} />
                    <MaterialIcons name="arrow-drop-down" size={sp(22)} color={AppColors.textColor2} />
                  </Pressable>
                </>
              )}
            </View>
          ))}
          <Pressable
            style={[styles.addRow, items.length >= maxItems && styles.addRowDisabled]}
            onPress={addItem}
          >
            <MaterialIcons name="add" size={sp(20)} color={AppColors.primaryColor} />
            <View style={{ width: w(6) }} />
            <BaseText
              title={`${t('box_add_item')} (${items.length}/${maxItems})`}
              size={sp(15)}
              fontWeight="bold"
              color={AppColors.primaryColor}
            />
          </Pressable>

          {/* ---- Stops ---- */}
          <SectionTitle title={t('box_stops_section')} hint={t('box_stops_hint')} />
          {stops.map((stop, idx) => (
            <View key={stop.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <BaseText
                  title={t('box_stop_label', { num: idx + 1 })}
                  size={sp(14)}
                  fontWeight="bold"
                  color={AppColors.textColorTheme}
                />
                {stops.length > 1 && (
                  <Pressable onPress={() => removeStop(stop.id)} hitSlop={8}>
                    <BaseText title={t('box_remove_stop')} size={sp(13)} color={AppColors.red} />
                  </Pressable>
                )}
              </View>
              <TextInput
                value={stop.place_name}
                onChangeText={(v) => patchStop(stop.id, { place_name: v })}
                placeholder={t('box_stop_name_hint')}
                placeholderTextColor={AppColors.textColor2}
                style={styles.input}
              />
              <View style={{ height: h(10) }} />
              <TextInput
                value={stop.address}
                onChangeText={(v) => patchStop(stop.id, { address: v })}
                placeholder={t('box_stop_address_hint')}
                placeholderTextColor={AppColors.textColor2}
                style={styles.input}
              />
              <View style={{ height: h(10) }} />
              <ComingSoonPin label={t('box_pin_on_map')} />
              <View style={{ height: h(10) }} />
              <TextInput
                value={stop.note}
                onChangeText={(v) => patchStop(stop.id, { note: v })}
                placeholder={t('box_stop_note_hint')}
                placeholderTextColor={AppColors.textColor2}
                style={styles.input}
              />
            </View>
          ))}
          <Pressable
            style={[styles.addRow, stops.length >= maxStops && styles.addRowDisabled]}
            onPress={addStop}
          >
            <MaterialIcons name="add" size={sp(20)} color={AppColors.primaryColor} />
            <View style={{ width: w(6) }} />
            <BaseText
              title={`${t('box_add_stop')} (${stops.length}/${maxStops})`}
              size={sp(15)}
              fontWeight="bold"
              color={AppColors.primaryColor}
            />
          </Pressable>

          {/* ---- Destination ---- */}
          <SectionTitle title={t('box_destination_section')} hint={t('box_destination_hint')} />
          <View style={styles.card}>
            <BaseText
              title={t('box_destination_address_label')}
              size={sp(13)}
              color={AppColors.textColor2}
            />
            <View style={{ height: h(8) }} />
            <TextInput
              value={destAddress}
              onChangeText={setDestAddress}
              placeholder={t('box_destination_address_hint')}
              placeholderTextColor={AppColors.textColor2}
              style={styles.input}
            />
            <View style={{ height: h(10) }} />
            <ComingSoonPin label={t('box_pin_destination')} />
          </View>

          {/* ---- Budget ---- */}
          <SectionTitle title={t('box_budget_section')} hint={t('box_budget_hint')} />
          <View style={styles.card}>
            <BaseText title={t('box_budget_label')} size={sp(13)} color={AppColors.textColor2} />
            <View style={{ height: h(8) }} />
            <TextInput
              value={budget}
              onChangeText={(v) => setBudget(v.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              placeholder={maxBudget > 0 ? formatPrice(maxBudget) : ''}
              placeholderTextColor={AppColors.textColor2}
              style={styles.input}
            />
          </View>

          {/* ---- Instructions ---- */}
          <View style={styles.card}>
            <BaseText
              title={t('box_instructions_label')}
              size={sp(13)}
              color={AppColors.textColor2}
            />
            <View style={{ height: h(8) }} />
            <TextInput
              value={instructions}
              onChangeText={setInstructions}
              multiline
              maxLength={200}
              placeholder={t('box_instructions_hint')}
              placeholderTextColor={AppColors.textColor2}
              style={[styles.input, styles.multiline]}
              textAlignVertical="top"
            />
          </View>

          {/* ---- Estimated service fee ---- */}
          {fee && (
            <View style={styles.feeCard}>
              <BaseText
                title={t('box_fee_section')}
                size={sp(15)}
                fontWeight="bold"
                color={AppColors.textColorTheme}
              />
              <View style={{ height: h(10) }} />
              <FeeRow label={t('box_fee_base')} value={formatPrice(fee.base)} />
              {fee.extraItems > 0 && (
                <FeeRow
                  label={`${t('box_fee_extra_items')} ×${fee.extraItems}`}
                  value={formatPrice(fee.extraItemsFee)}
                />
              )}
              {fee.extraStops > 0 && (
                <FeeRow
                  label={`${t('box_fee_extra_stops')} ×${fee.extraStops}`}
                  value={formatPrice(fee.extraStopsFee)}
                />
              )}
              <View style={styles.feeDivider} />
              <FeeRow label={t('box_fee_section')} value={formatPrice(fee.total)} bold />
              <View style={{ height: h(8) }} />
              <BaseText
                title={t('box_fee_estimate_note')}
                size={sp(12)}
                color={AppColors.textColor2}
              />
            </View>
          )}

          {/* ---- Disclaimer ---- */}
          <Pressable style={styles.disclaimerRow} onPress={() => setAccepted((v) => !v)}>
            <MaterialIcons
              name={accepted ? 'check-box' : 'check-box-outline-blank'}
              size={sp(22)}
              color={accepted ? AppColors.primaryColor : AppColors.textColor2}
            />
            <View style={{ width: w(10) }} />
            <View style={{ flex: 1 }}>
              <BaseText title={t('box_disclaimer')} size={sp(13)} color={AppColors.textColorTheme} />
            </View>
          </Pressable>

          {/* ---- Place order (COD) ---- */}
          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={AppColors.white} />
            ) : (
              <BaseText
                title={t('box_place_order')}
                size={sp(16)}
                fontWeight="bold"
                color={AppColors.white}
              />
            )}
          </Pressable>
        </ScrollView>
      )}

      {/* Per-item "from which place" picker */}
      <Modal
        visible={stopPickerFor != null}
        transparent
        animationType="fade"
        onRequestClose={() => setStopPickerFor(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setStopPickerFor(null)}>
          <View style={styles.modalMenu}>
            {stops.map((s, idx) => (
              <Pressable
                key={s.id}
                style={styles.modalItem}
                onPress={() => {
                  if (stopPickerFor) patchItem(stopPickerFor, { stopId: s.id });
                  setStopPickerFor(null);
                }}
              >
                <BaseText
                  title={s.place_name.trim() || t('box_stop_label', { num: idx + 1 })}
                  size={sp(15)}
                  color={AppColors.textColorTheme}
                />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={{ marginTop: h(20), marginBottom: h(10) }}>
      <BaseText title={title} size={sp(16)} fontWeight="bold" color={AppColors.textColorTheme} />
      {hint ? (
        <>
          <View style={{ height: h(2) }} />
          <BaseText title={hint} size={sp(12)} color={AppColors.textColor2} />
        </>
      ) : null}
    </View>
  );
}

function Stepper({ value, onDec, onInc }: { value: number; onDec: () => void; onInc: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onDec} hitSlop={6} style={styles.stepBtn}>
        <MaterialIcons name="remove" size={sp(18)} color={AppColors.primaryColor} />
      </Pressable>
      <BaseText
        title={String(value)}
        size={sp(15)}
        fontWeight="bold"
        color={AppColors.textColorTheme}
      />
      <Pressable onPress={onInc} hitSlop={6} style={styles.stepBtn}>
        <MaterialIcons name="add" size={sp(18)} color={AppColors.primaryColor} />
      </Pressable>
    </View>
  );
}

// Map-pin entry shown DISABLED while the in-app map picker for Box is still
// being built ("coming soon"). The customer enters a text address instead;
// coords are optional server-side, so orders still go through without a pin.
function ComingSoonPin({ label }: { label: string }) {
  return (
    <View style={[styles.pinRow, styles.pinRowDisabled]}>
      <MaterialIcons name="schedule" size={sp(20)} color={AppColors.textColor2} />
      <View style={{ width: w(8) }} />
      <BaseText title={label} size={sp(14)} fontWeight="500" color={AppColors.textColor2} />
      <View style={{ flex: 1 }} />
      <View style={styles.comingSoonPill}>
        <BaseText title={t('coming_soon')} size={sp(11)} fontWeight="600" color={AppColors.primaryColor} />
      </View>
    </View>
  );
}

function FeeRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.feeRow}>
      <BaseText
        title={label}
        size={bold ? sp(15) : sp(13)}
        fontWeight={bold ? 'bold' : 'normal'}
        color={bold ? AppColors.textColorTheme : AppColors.textColor2}
      />
      <BaseText
        title={value}
        size={bold ? sp(15) : sp(13)}
        fontWeight={bold ? 'bold' : '600'}
        color={bold ? AppColors.primaryColor : AppColors.textColorTheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.backgroundColor },
  appBar: {
    height: h(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(8),
    backgroundColor: AppColors.white,
  },
  iconBtn: { width: w(40), height: w(40), alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(143,169,189,0.3)' },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  introCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: w(14),
    borderRadius: r(12),
    backgroundColor: 'rgba(35,90,94,0.06)',
  },
  card: {
    padding: w(14),
    borderRadius: r(12),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    backgroundColor: AppColors.white,
    marginBottom: h(10),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: h(10),
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(10),
    paddingHorizontal: w(12),
    paddingVertical: h(12),
    fontSize: sp(14),
    fontFamily: QuicksandFamily.regular,
    color: AppColors.textColorTheme,
    backgroundColor: AppColors.white,
  },
  multiline: { minHeight: h(80) },
  row: { flexDirection: 'row', alignItems: 'center' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    borderRadius: r(10),
    paddingHorizontal: w(6),
  },
  stepBtn: { width: w(34), height: w(34), alignItems: 'center', justifyContent: 'center' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: w(8) },
  chip: {
    paddingHorizontal: w(12),
    paddingVertical: h(6),
    borderRadius: r(20),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    backgroundColor: AppColors.white,
  },
  chipOn: { backgroundColor: AppColors.primaryColor, borderColor: AppColors.primaryColor },
  fromStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: h(10),
    paddingHorizontal: w(12),
    borderRadius: r(10),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    backgroundColor: AppColors.whiteApplication,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: h(10),
    paddingHorizontal: w(12),
    borderRadius: r(10),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    backgroundColor: AppColors.whiteApplication,
  },
  pinRowDisabled: {
    opacity: 0.7,
    borderStyle: 'dashed',
  },
  comingSoonPill: {
    paddingHorizontal: w(8),
    paddingVertical: h(3),
    borderRadius: r(20),
    backgroundColor: 'rgba(35,90,94,0.10)',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: h(12),
    borderRadius: r(10),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: AppColors.primaryColor,
  },
  addRowDisabled: { opacity: 0.5 },
  feeCard: {
    marginTop: h(20),
    padding: w(14),
    borderRadius: r(12),
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: h(3),
  },
  feeDivider: { height: 1, backgroundColor: AppColors.lightGreyV2, marginVertical: h(8) },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: h(20),
    marginBottom: h(16),
  },
  submitBtn: {
    width: '100%',
    height: h(52),
    backgroundColor: AppColors.primaryColor,
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    paddingHorizontal: w(40),
  },
  modalMenu: { backgroundColor: AppColors.white, borderRadius: r(12), paddingVertical: h(8) },
  modalItem: { paddingHorizontal: w(20), paddingVertical: h(14) },
});
