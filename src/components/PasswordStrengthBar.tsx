// Live password strength meter + requirements checklist for the sign-up / reset
// screens. The validity gate (isPasswordValid) matches the backend register rule
// exactly (jawlahapp validation.js: >= 6 chars + lowercase + uppercase + digit),
// so a password the meter accepts is also accepted by the server.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { BaseText } from '@/components';
import { t } from '@/i18n';

export interface PasswordChecks {
  length: boolean;
  lower: boolean;
  upper: boolean;
  digit: boolean;
}

export function passwordChecks(pw: string): PasswordChecks {
  return {
    length: pw.length >= 6,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    digit: /\d/.test(pw),
  };
}

// Backend register rule: >= 6 chars + at least one lower, upper and digit.
export function isPasswordValid(pw: string): boolean {
  const c = passwordChecks(pw);
  return c.length && c.lower && c.upper && c.digit;
}

function strength(pw: string): { score: 1 | 2 | 3; color: string; labelKey: string } {
  if (!isPasswordValid(pw)) return { score: 1, color: AppColors.red, labelKey: 'password_weak' };
  if (pw.length < 10) return { score: 2, color: AppColors.orange, labelKey: 'password_medium' };
  return { score: 3, color: AppColors.green, labelKey: 'password_strong_short' };
}

function ReqItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={styles.reqItem}>
      <Ionicons
        name={ok ? 'checkmark-circle' : 'ellipse-outline'}
        size={sp(14)}
        color={ok ? AppColors.green : AppColors.hintColor}
      />
      <BaseText
        title={label}
        style={{
          fontFamily: quicksand('500'),
          fontSize: sp(12),
          color: ok ? AppColors.green : AppColors.greyTextColorV3,
          marginHorizontal: w(4),
        }}
      />
    </View>
  );
}

export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { score, color, labelKey } = strength(password);
  const checks = passwordChecks(password);
  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        <View style={styles.segments}>
          {[1, 2, 3].map((seg) => (
            <View
              key={seg}
              style={[styles.segment, { backgroundColor: seg <= score ? color : AppColors.dividerColor }]}
            />
          ))}
        </View>
        <BaseText
          title={t(labelKey)}
          style={{ fontFamily: quicksand('bold'), fontSize: sp(12), color }}
        />
      </View>
      <View style={styles.reqWrap}>
        <ReqItem ok={checks.length} label={t('pw_req_length')} />
        <ReqItem ok={checks.upper} label={t('pw_req_upper')} />
        <ReqItem ok={checks.lower} label={t('pw_req_lower')} />
        <ReqItem ok={checks.digit} label={t('pw_req_digit')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: h(8), alignSelf: 'stretch' },
  barRow: { flexDirection: 'row', alignItems: 'center' },
  segments: { flex: 1, flexDirection: 'row', marginEnd: w(8) },
  segment: { flex: 1, height: h(5), borderRadius: r(3), marginHorizontal: w(2) },
  reqWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: h(8) },
  reqItem: { flexDirection: 'row', alignItems: 'center', marginEnd: w(12), marginBottom: h(4) },
});

export default PasswordStrengthBar;
