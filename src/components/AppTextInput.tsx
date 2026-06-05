import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {
  blackColor,
  loginIconGrey,
  loginInputBg,
  loginInputBorder,
  loginPlaceholder,
  loginTextDark,
  redColor,
} from '../constants/Color';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { heightPercentageToDP } from '../utils';

type IconFamily = 'material' | 'feather';

type AppTextInputProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  leftIconName?: string;
  leftIconFamily?: IconFamily;
  rightIconName?: string;
  rightIconFamily?: IconFamily;
  onRightIconPress?: () => void;
};

const AppTextInput = ({
  label,
  required = false,
  error,
  leftIconName,
  leftIconFamily = 'material',
  rightIconName,
  rightIconFamily = 'feather',
  onRightIconPress,
  style: inputStyle,
  ...textInputProps
}: AppTextInputProps) => {
  const LeftIcon =
    leftIconFamily === 'feather' ? Feather : MaterialCommunityIcons;
  const RightIcon =
    rightIconFamily === 'feather' ? Feather : MaterialCommunityIcons;

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={[style.fontSizeSmall2x, style.fontWeightMedium, styles.label]}>
          {label}
        </Text>
        {required ? (
          <Text style={[style.fontSizeSmall2x, styles.requiredStar]}>*</Text>
        ) : null}
      </View>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        {leftIconName ? (
          <LeftIcon
            name={leftIconName}
            size={20}
            color={loginIconGrey}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          placeholderTextColor={loginPlaceholder}
          style={[styles.input, inputStyle]}
          {...textInputProps}
        />
        {rightIconName ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}>
            <RightIcon name={rightIconName} size={20} color={loginIconGrey} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text style={[style.fontSizeSmall1x, styles.errorText]}>{error}</Text>
      ) : null}
    </View>
  );
};

export default AppTextInput;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacings.xLarge,
  },
  labelRow: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    marginBottom: spacings.large,
  },
  label: {
    color: loginTextDark,
  },
  requiredStar: {
    color: blackColor,
    marginLeft: spacings.xsmall,
    ...style.fontWeightMedium1x,
  },
  inputRow: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    backgroundColor: loginInputBg,
    borderWidth: 1,
    borderColor: loginInputBorder,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    minHeight: heightPercentageToDP(5.3),
  },
  inputRowError: {
    borderColor: redColor,
  },
  errorText: {
    color: redColor,
    marginTop: spacings.xsmall,
    ...style.fontWeightThin,
  },
  leftIcon: {
    marginRight: spacings.normal,
  },
  input: {
    flex: 1,
    padding: 0,
    margin: 0,
    color: loginTextDark,
    ...style.fontSizeNormal2x,
    ...style.fontWeightThin,
  },
});
