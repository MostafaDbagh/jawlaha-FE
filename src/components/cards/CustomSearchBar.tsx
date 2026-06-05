// Ported from: lib/screens/cart/widgets/custom_search_bar.dart
import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, w, h, r } from '@/theme';
import { QuicksandFamily } from '@/theme/typography';

export interface CustomSearchBarProps {
  readOnly?: boolean;
  onPress?: () => void;
  onSubmitted?: (value: string) => void;
  value?: string;
  onChangeText?: (value: string) => void;
  onTune?: () => void;
}

export function CustomSearchBar(props: CustomSearchBarProps) {
  const { readOnly = false, onPress, onSubmitted, value, onChangeText, onTune } = props;

  return (
    <Pressable onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.searchContainer}>
          <View style={styles.innerRow}>
            <MaterialIcons name="search" size={r(24)} color={AppColors.textColor2} />
            <View style={{ width: w(10) }} />
            <View style={{ flex: 1 }}>
              <TextInput
                value={value}
                onChangeText={onChangeText}
                editable={!readOnly}
                onPressIn={readOnly ? onPress : undefined}
                onSubmitEditing={(e) => onSubmitted?.(e.nativeEvent.text)}
                placeholder="Search here!"
                placeholderTextColor={AppColors.textColor2}
                style={styles.input}
              />
            </View>
          </View>
        </View>
        {/* Filter/tune button only renders when a handler is supplied, so the
            search field expands to full width on screens that don't need it. */}
        {onTune && (
          <>
            <View style={{ width: w(12) }} />
            <Pressable
              style={styles.tuneContainer}
              onPress={onTune}
              hitSlop={8}
            >
              <MaterialIcons name="tune" size={r(24)} color={AppColors.textColorTheme} />
            </Pressable>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    height: h(45),
    paddingHorizontal: w(16),
    backgroundColor: AppColors.lightGreyV2 + '80', // withOpacity(0.5)
    borderRadius: r(12),
    justifyContent: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    padding: 0,
    fontFamily: QuicksandFamily.regular,
    color: AppColors.textColorTheme,
  },
  tuneContainer: {
    height: h(45),
    width: h(45),
    backgroundColor: AppColors.lightGreyV2 + '80', // withOpacity(0.5)
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
