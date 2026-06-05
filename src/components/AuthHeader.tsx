import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  loginPrimaryPurple,
  loginTextDark,
  loginTextGrey,
  whiteColor,
} from '../constants/Color';
import { APP_NAME } from '../constants/Constants';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => (
  <View>
    <View style={styles.headerRow}>
      <View style={styles.logoCircle}>
        <MaterialCommunityIcons
          name="star-four-points"
          size={22}
          color={whiteColor}
        />
        <Text style={styles.logoPlus}>+</Text>
      </View>
      <Text style={styles.appName}>{APP_NAME}</Text>
    </View>

    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

export default AuthHeader;

const styles = StyleSheet.create({
  headerRow: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    marginBottom: spacings.ExtraLarge2x,
  },
  logoCircle: {
    width: spacings.ExtraLarge4x + spacings.normal,
    height: spacings.ExtraLarge4x + spacings.normal,
    borderRadius: (spacings.ExtraLarge4x + spacings.normal) / 2,
    backgroundColor: loginPrimaryPurple,
    ...BaseStyle.alignJustifyCenter,
    shadowColor: loginPrimaryPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  logoPlus: {
    position: 'absolute',
    bottom: spacings.small2x,
    right: spacings.normal,
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: whiteColor,
    ...style.fontWeightMedium1x,
  },
  appName: {
    marginLeft: spacings.large,
    color: loginTextDark,
    fontSize: style.fontSizeLarge.fontSize,
    ...style.fontWeightMedium1x,
  },
  title: {
    color: loginTextDark,
    fontSize: style.fontSizeExtraLarge.fontSize,
    ...style.fontWeightMedium1x,
    marginBottom: spacings.small2x,
  },
  subtitle: {
    color: loginTextGrey,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightThin,
    lineHeight: style.fontSizeLargeXX.fontSize,
    marginBottom: spacings.ExtraLarge1x,
  },
});
