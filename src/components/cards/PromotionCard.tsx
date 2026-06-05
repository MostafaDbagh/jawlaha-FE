// Ported from lib/widgets/promotion_card.dart (PromotionCard)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { w, h, r, sp } from '@/theme';
import { t } from '@/i18n';
import { BaseText } from '@/components';

export interface PromotionCardProps {
  title: string;
  description: string;
  code: string;
  backgroundColor: string;
}

export function PromotionCard({
  title,
  description,
  code,
  backgroundColor,
}: PromotionCardProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.row}>
        <View style={styles.expanded}>
          <View style={styles.titleRow}>
            <MaterialIcons name="local-offer" color="white" size={sp(18)} />
            <View style={{ width: w(8) }} />
            <BaseText title={title} style={styles.titleText} />
          </View>
          <View style={{ height: h(4) }} />
          <BaseText
            title={description}
            numberOfLines={2}
            style={styles.descriptionText}
          />
          <View style={{ height: h(8) }} />
          <View style={styles.codeContainer}>
            <BaseText
              title={`${t('use_code')} ${code}`}
              style={styles.codeText}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: w(280),
    marginRight: w(12),
    padding: w(16),
    borderRadius: r(12),
  },
  row: {
    flexDirection: 'row',
  },
  expanded: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    color: 'white',
    fontSize: sp(16),
    fontWeight: 'bold',
  },
  descriptionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: sp(12),
  },
  codeContainer: {
    paddingHorizontal: w(10),
    paddingVertical: h(4),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: r(4),
  },
  codeText: {
    color: 'white',
    fontSize: sp(11),
    fontWeight: '600',
  },
});

export default PromotionCard;
