// Help & Support screen — FAQs, contact options, and self-help resources.
// Layout follows the Jawla Figma; colors use the app's teal theme.
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  Linking,
  Keyboard,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { quicksand } from '@/theme/typography';
import { t, useI18n } from '@/i18n';
import { BaseText } from '@/components';
import { goBack } from '@/lib/nav';
import { showSnack } from '@/lib/snack';

// Enable layout animation for the FAQ accordion on Android.
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Mirrors AppColors.x.withOpacity(o) -> 8-digit hex.
function hexWithOpacity(hex: string, opacity: number): string {
  const a = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

const FAQS = [
  { q: 'faq_track_order_q', a: 'faq_track_order_a' },
  { q: 'faq_payment_q', a: 'faq_payment_a' },
  { q: 'faq_return_q', a: 'faq_return_a' },
  { q: 'faq_edit_address_q', a: 'faq_edit_address_a' },
  { q: 'faq_loyalty_q', a: 'faq_loyalty_a' },
] as const;

export default function HelpSupportScreen() {
  const router = useRouter();
  const { isRTL } = useI18n(); // re-render (and flip icons) on language change

  // First FAQ expanded by default (matches the Figma).
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [question, setQuestion] = useState('');

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq((current) => (current === index ? null : index));
  };

  const onSendQuestion = () => {
    if (!question.trim()) {
      showSnack(t('question_required'), 'info');
      return;
    }
    Keyboard.dismiss();
    setQuestion('');
    showSnack(t('question_sent'), 'success');
  };

  const onCallSupport = () => {
    const number = t('phone_support_number').replace(/\s/g, '');
    Linking.openURL(`tel:${number}`).catch(() => {
      showSnack(t('phone_support_number'), 'info');
    });
  };

  const forwardIcon = isRTL ? 'chevron-back' : 'chevron-forward';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable
          onPress={() => goBack(router, '/(tabs)/profile')}
          hitSlop={8}
          style={styles.leading}
        >
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={sp(24)}
            color={AppColors.textColorTheme}
          />
        </Pressable>
        <BaseText
          title={t('help_support')}
          size={sp(18)}
          fontWeight="bold"
          color={AppColors.textColorTheme}
        />
        <View style={styles.leading} />
      </View>
      <View style={styles.divider} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: w(16), paddingBottom: h(32) }}
      >
        {/* FAQs */}
        <SectionTitle title={t('faqs')} />
        <View style={{ gap: h(12) }}>
          {FAQS.map((faq, index) => {
            const expanded = openFaq === index;
            return (
              <Pressable
                key={faq.q}
                onPress={() => toggleFaq(index)}
                style={[styles.faqCard, expanded && styles.faqCardOpen]}
              >
                <View style={styles.faqHeader}>
                  <BaseText
                    title={t(faq.q)}
                    size={sp(14)}
                    fontWeight="600"
                    color={AppColors.textColorTheme}
                    style={{ flex: 1 }}
                  />
                  <View style={{ width: w(8) }} />
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={sp(18)}
                    color={AppColors.primaryColor}
                  />
                </View>
                {expanded && (
                  <BaseText
                    title={t(faq.a)}
                    size={sp(13)}
                    color={AppColors.textColor3}
                    style={styles.faqAnswer}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Contact Us */}
        <SectionTitle title={t('contact_us')} style={{ marginTop: h(28) }} />

        {/* Question input */}
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Ionicons
              name="mail-outline"
              size={sp(18)}
              color={AppColors.textColor2}
            />
            <TextInput
              style={styles.input}
              value={question}
              onChangeText={setQuestion}
              placeholder={t('contact_question_hint')}
              placeholderTextColor={AppColors.textColor2}
              textAlign={isRTL ? 'right' : 'left'}
              returnKeyType="send"
              onSubmitEditing={onSendQuestion}
            />
            <Pressable
              onPress={onSendQuestion}
              hitSlop={6}
              style={styles.sendButton}
            >
              <Ionicons name="send" size={sp(16)} color={AppColors.white} />
            </Pressable>
          </View>
          <BaseText
            title={t('contact_response_time')}
            size={sp(12)}
            color={AppColors.primaryColor}
            style={{ marginTop: h(10) }}
          />
        </View>

        {/* Phone support */}
        <Pressable
          onPress={onCallSupport}
          style={[styles.card, styles.contactRow, { marginTop: h(12) }]}
        >
          <IconCircle icon="call-outline" />
          <View style={styles.contactBody}>
            <BaseText
              title={t('phone_support')}
              size={sp(14)}
              fontWeight="600"
              color={AppColors.textColorTheme}
            />
            <BaseText
              title={t('phone_support_number')}
              size={sp(13)}
              color={AppColors.textColor3}
              style={{ marginTop: h(2) }}
            />
            <BaseText
              title={t('phone_support_hours')}
              size={sp(12)}
              color={AppColors.textColor2}
              style={{ marginTop: h(2) }}
            />
          </View>
        </Pressable>

        {/* Chat with us */}
        <View style={[styles.card, { marginTop: h(12) }]}>
          <View style={styles.contactRow}>
            <IconCircle icon="chatbubble-ellipses-outline" />
            <View style={styles.contactBody}>
              <BaseText
                title={t('chat_with_us')}
                size={sp(14)}
                fontWeight="600"
                color={AppColors.textColorTheme}
              />
              <BaseText
                title={t('chat_response_time')}
                size={sp(12)}
                color={AppColors.textColor2}
                style={{ marginTop: h(2) }}
              />
            </View>
          </View>
          <Pressable
            onPress={() => showSnack(t('coming_soon'), 'info')}
            style={styles.chatButton}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={sp(16)}
              color={AppColors.white}
            />
            <View style={{ width: w(8) }} />
            <BaseText
              title={t('start_chat')}
              size={sp(14)}
              fontWeight="600"
              color={AppColors.white}
            />
          </Pressable>
        </View>

        {/* Self-Help Resources */}
        <SectionTitle
          title={t('self_help_resources')}
          style={{ marginTop: h(28) }}
        />
        <View style={{ gap: h(12) }}>
          <ResourceRow
            icon="book-outline"
            title={t('knowledge_base_title')}
            desc={t('knowledge_base_desc')}
            forwardIcon={forwardIcon}
            onPress={() => showSnack(t('coming_soon'), 'info')}
          />
          <ResourceRow
            icon="play-circle-outline"
            title={t('video_tutorials_title')}
            desc={t('video_tutorials_desc')}
            forwardIcon={forwardIcon}
            onPress={() => showSnack(t('coming_soon'), 'info')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
  style,
}: {
  title: string;
  style?: object;
}) {
  return (
    <BaseText
      title={title}
      size={sp(16)}
      fontWeight="600"
      color={AppColors.textColorTheme}
      style={[{ marginBottom: h(12) }, style]}
    />
  );
}

function IconCircle({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={sp(20)} color={AppColors.primaryColor} />
    </View>
  );
}

function ResourceRow({
  icon,
  title,
  desc,
  forwardIcon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  forwardIcon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.card, styles.contactRow]}>
      <IconCircle icon={icon} />
      <View style={styles.contactBody}>
        <BaseText
          title={title}
          size={sp(14)}
          fontWeight="600"
          color={AppColors.textColorTheme}
        />
        <BaseText
          title={desc}
          size={sp(12)}
          color={AppColors.textColor2}
          style={{ marginTop: h(2) }}
        />
      </View>
      <Ionicons name={forwardIcon} size={sp(18)} color={AppColors.textColor2} />
    </Pressable>
  );
}

const CARD_SHADOW = {
  shadowColor: hexWithOpacity(AppColors.black, 0.05),
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 10,
  shadowOpacity: 1,
  elevation: 2,
} as const;

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
  leading: {
    width: w(40),
    height: w(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: 'rgba(143,169,189,0.3)' },

  // FAQ accordion
  faqCard: {
    backgroundColor: hexWithOpacity(AppColors.primaryColor, 0.06),
    borderRadius: r(12),
    paddingHorizontal: w(14),
    paddingVertical: h(14),
  },
  faqCardOpen: {
    backgroundColor: hexWithOpacity(AppColors.primaryColor, 0.08),
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqAnswer: {
    marginTop: h(10),
    lineHeight: sp(20),
  },

  // Generic white card
  card: {
    backgroundColor: AppColors.white,
    borderRadius: r(16),
    padding: w(16),
    ...CARD_SHADOW,
  },

  // Question input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: h(48),
    paddingHorizontal: w(12),
    borderRadius: r(10),
    borderWidth: 1,
    borderColor: AppColors.lightGreyV2,
    backgroundColor: AppColors.white,
  },
  input: {
    flex: 1,
    marginHorizontal: w(8),
    fontSize: sp(14),
    fontFamily: quicksand('400'),
    color: AppColors.textColorTheme,
    paddingVertical: 0,
  },
  sendButton: {
    width: w(36),
    height: w(36),
    borderRadius: r(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.green,
  },

  // Contact / resource rows
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactBody: {
    flex: 1,
    marginHorizontal: w(12),
  },
  iconCircle: {
    width: w(40),
    height: w(40),
    borderRadius: w(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexWithOpacity(AppColors.primaryColor, 0.1),
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: h(44),
    borderRadius: r(10),
    marginTop: h(14),
    backgroundColor: AppColors.primaryColor,
  },
});
