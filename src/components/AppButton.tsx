import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  createAvatarButtonDisabledBg,
  createAvatarButtonDisabledText,
  loginPrimaryPurple,
  whiteColor,
} from '../constants/Color';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';

type AppButtonProps = TouchableOpacityProps & {
  title: string;
  showArrow?: boolean;
  loading?: boolean;
  mutedWhenDisabled?: boolean;
};

const AppButton = ({
  title,
  showArrow = false,
  loading = false,
  mutedWhenDisabled = false,
  disabled,
  style: buttonStyle,
  ...touchableProps
}: AppButtonProps) => {
  const isDisabled = disabled || loading;
  const useMutedStyle = mutedWhenDisabled && isDisabled && !loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[
        styles.button,
        isDisabled && !useMutedStyle && styles.buttonDisabled,
        useMutedStyle && styles.buttonMuted,
        buttonStyle,
      ]}
      {...touchableProps}>
      {loading ? (
        <ActivityIndicator color={whiteColor} />
      ) : (
        <View style={styles.content}>
          <Text
            style={[
              style.fontSizeNormal2x,
              style.fontWeightMedium1x,
              styles.title,
              useMutedStyle && styles.titleMuted,
            ]}>
            {title}
          </Text>
          {showArrow ? (
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={whiteColor}
              style={styles.arrow}
            />
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    ...BaseStyle.alignJustifyCenter,
    backgroundColor: loginPrimaryPurple,
    borderRadius: 28,
    paddingVertical: spacings.xLarge,
    paddingHorizontal: spacings.xxLarge,
    marginTop: spacings.normal,
    shadowColor: loginPrimaryPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonMuted: {
    backgroundColor: createAvatarButtonDisabledBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  titleMuted: {
    color: createAvatarButtonDisabledText,
  },
  content: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    ...BaseStyle.justifyContentCenter,
  },
  title: {
    color: whiteColor,
  },
  arrow: {
    marginLeft: spacings.normal,
  },
});
