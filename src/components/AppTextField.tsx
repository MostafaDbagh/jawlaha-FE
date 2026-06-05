// Ported from core/widgets/text/custom_text_from_field.dart (CustomTextFormField)
import React, { useState } from 'react';
import {
  View,
  TextInput,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { AppColors, sp, Radii } from '@/theme';
import { Responsive } from '@/theme/responsive';
import { BaseText } from './BaseText';

export type BorderStyleType = 'outlineInput' | 'underline' | 'none';

export interface AppTextFieldProps {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  hintText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  obscureText?: boolean;
  keyboardType?: KeyboardTypeOptions;
  borderStyleType?: BorderStyleType;
  /** returns an error string, or null/undefined when valid (mirrors Flutter validator) */
  validator?: (value: string) => string | null | undefined;
  errorText?: string | null;
  maxLines?: number;
  enabled?: boolean;
  readOnly?: boolean;
  onTap?: () => void;
  width?: number | string;
  fillColor?: string;
  textAlign?: 'left' | 'right' | 'center';
  onSubmitEditing?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
  /** expose ref-free imperative validate via callback registration */
  registerValidate?: (fn: () => boolean) => void;
}

export function AppTextField(props: AppTextFieldProps) {
  const {
    label,
    value,
    onChangeText,
    hintText = '',
    prefixIcon,
    suffixIcon,
    obscureText = false,
    keyboardType = 'default',
    borderStyleType = 'none',
    validator,
    errorText,
    maxLines = 1,
    enabled = true,
    readOnly = false,
    onTap,
    width,
    fillColor,
    textAlign = 'left',
    onSubmitEditing,
    containerStyle,
    style,
    registerValidate,
  } = props;

  const [localError, setLocalError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const runValidate = React.useCallback(() => {
    if (!validator) return true;
    const err = validator(value) ?? null;
    setLocalError(err);
    return err == null;
  }, [validator, value]);

  React.useEffect(() => {
    registerValidate?.(runValidate);
  }, [registerValidate, runValidate]);

  const shownError = errorText ?? localError;

  const borderColor = shownError
    ? AppColors.errorColor
    : focused
      ? AppColors.primaryColorTheme
      : AppColors.lightGray;

  const borderStyle: ViewStyle =
    borderStyleType === 'underline'
      ? { borderBottomWidth: 1, borderColor }
      : borderStyleType === 'none'
        ? {}
        : { borderWidth: 1, borderColor, borderRadius: Radii.textField };

  return (
    <View style={[{ width: width as any, gap: Responsive.gapTiny }, containerStyle]}>
      {label != null && (
        <BaseText
          title={label}
          style={[{ color: AppColors.primaryColorTheme, fontSize: sp(16), fontWeight: '400' }]}
        />
      )}
      <View
        style={[
          styles.inputRow,
          borderStyle,
          { backgroundColor: fillColor ?? AppColors.white },
        ]}
      >
        {prefixIcon ? <View style={styles.affix}>{prefixIcon}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={hintText}
          placeholderTextColor={AppColors.hintColor}
          secureTextEntry={obscureText}
          keyboardType={keyboardType}
          editable={enabled && !readOnly}
          onPressIn={onTap}
          multiline={maxLines > 1}
          numberOfLines={maxLines}
          textAlign={textAlign}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            runValidate();
          }}
          onSubmitEditing={onSubmitEditing}
          autoCorrect={false}
          style={[styles.input, style]}
        />
        {suffixIcon ? <View style={styles.affix}>{suffixIcon}</View> : null}
      </View>
      {shownError ? (
        <BaseText title={shownError} size={sp(12)} color={AppColors.red} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.paddingSmall,
  },
  input: {
    flex: 1,
    paddingVertical: Responsive.paddingTiny,
    fontSize: sp(14),
    color: AppColors.textColorTheme,
  },
  affix: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppTextField;
