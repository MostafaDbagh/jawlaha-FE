// Rate-your-order screen — a customer leaves a star rating (1-5) + optional
// comment for a restaurant. Reached from a DELIVERED order in order-details.
// The backend only accepts a review once an order has actually been delivered
// from this branch and allows one review per branch; failures (already
// reviewed / not eligible) surface via the returned message.
import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, w, h, r, sp } from '@/theme';
import { AppBar, BaseText, AppTextField, LoadingButton } from '@/components';
import { t } from '@/i18n';
import { showSnack } from '@/lib/snack';
import { useNavArgs } from '@/store/navArgs';
import { catalogRepo } from '@/data/repository';

export default function WriteReviewScreen() {
  const router = useRouter();
  const args = useNavArgs((s) => s.args);
  const branchId = args?.reviewBranchId as string | undefined;
  const vendorName = (args?.reviewVendorName as string | undefined) ?? '';

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating < 1) {
      showSnack(t('please_select_rating'), 'error');
      return;
    }
    if (!branchId) {
      showSnack(t('couldnt_load'), 'error');
      return;
    }
    try {
      setSubmitting(true);
      const res = await catalogRepo.createReview(branchId, {
        rating,
        comment: comment.trim(),
      });
      if (res.success) {
        showSnack(t('review_submitted'), 'success');
        router.back();
      } else {
        // Backend message covers "already reviewed" / "not eligible" cases.
        showSnack(res.msg || t('couldnt_load'), 'error');
      }
    } catch (e) {
      showSnack(t('couldnt_load'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <AppBar title={t('rate_your_order')} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!!vendorName && (
          <BaseText
            title={vendorName}
            size={sp(18)}
            fontWeight="bold"
            color={AppColors.black}
            textAlign="center"
          />
        )}
        <View style={{ height: h(8) }} />
        <BaseText
          title={t('your_rating')}
          size={sp(14)}
          color={AppColors.textColor2}
          textAlign="center"
        />
        <View style={{ height: h(16) }} />

        {/* Star picker */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setRating(n)}
              hitSlop={6}
              style={styles.starHit}
            >
              <Ionicons
                name={n <= rating ? 'star' : 'star-outline'}
                size={sp(40)}
                color={n <= rating ? AppColors.startColor : AppColors.lightGreyV2}
              />
            </Pressable>
          ))}
        </View>

        <View style={{ height: h(24) }} />
        <BaseText
          title={t('add_comment_optional')}
          size={sp(14)}
          color={AppColors.textColor2}
        />
        <View style={{ height: h(8) }} />
        <AppTextField
          value={comment}
          onChangeText={setComment}
          hintText={t('review_comment_hint')}
          borderStyleType="outlineInput"
          maxLines={5}
          fillColor={AppColors.white}
        />

        <View style={{ height: h(28) }} />
        <LoadingButton
          loading={submitting}
          onPress={submit}
          height={h(52)}
          borderRadius={r(14)}
          color={AppColors.primaryColor}
        >
          <BaseText
            title={t('submit_review')}
            size={sp(16)}
            color={AppColors.white}
            fontWeight="bold"
          />
        </LoadingButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.white },
  content: { padding: w(16) },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starHit: { paddingHorizontal: w(6) },
});
