import React, { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { clearAppSession } from '../services/sessionStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import {
  createAvatarHeaderBackBg,
  homeCardBorder,
  homeHeaderPurple,
  homeHeaderPurpleLight,
  loginPrimaryPurple,
  loginTextDark,
  loginTextGrey,
  profileMemberBadgeBg,
  profilePageBg,
  profileRowIconBg,
  profileSignOutColor,
  profileSummaryBorder,
  whiteColor,
} from '../constants/Color';
import {
  PROFILE_ABOUT,
  PROFILE_APP_SECTION,
  PROFILE_AVATARS_CREATED,
  PROFILE_CONVERSATIONS,
  PROFILE_EDIT,
  PROFILE_EMAIL,
  PROFILE_FULL_NAME,
  PROFILE_MEMBER_SINCE,
  PROFILE_MOCK_EMAIL,
  PROFILE_MOCK_MEMBER_DATE,
  PROFILE_MOCK_NAME,
  PROFILE_PRIVACY,
  PROFILE_SIGN_OUT,
  PROFILE_TITLE,
} from '../constants/Constants';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { AuthStackParamList } from '../navigation/types';

type ProfileScreenProps = NativeStackScreenProps<AuthStackParamList, 'Profile'>;

type DetailRowProps = {
  icon: string;
  label: string;
  value: string;
};

const DetailRow = ({ icon, label, value }: DetailRowProps) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLeft}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={loginPrimaryPurple}
      />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={styles.detailValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

type MenuRowProps = {
  icon: string;
  label: string;
  value?: string;
  showChevron?: boolean;
  onPress?: () => void;
};

const MenuRow = ({
  icon,
  label,
  value,
  showChevron = false,
  onPress,
}: MenuRowProps) => (
  <TouchableOpacity
    style={styles.menuRow}
    onPress={onPress}
    activeOpacity={onPress ? 0.65 : 1}
    disabled={!onPress && !value}>
    <View style={[styles.menuIcon, value ? styles.menuIconSoft : null]}>
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={loginPrimaryPurple}
      />
    </View>
    <View style={styles.menuText}>
      <Text style={styles.menuLabel}>{label}</Text>
      {value ? <Text style={styles.menuValue}>{value}</Text> : null}
    </View>
    {showChevron ? (
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={loginTextGrey}
      />
    ) : null}
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation, route }: ProfileScreenProps) => {
  const fullName = route.params?.fullName ?? PROFILE_MOCK_NAME;
  const email = route.params?.email ?? PROFILE_MOCK_EMAIL;

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile', {
      fullName,
      email,
      phone: route.params?.phone,
    });
  }, [navigation, fullName, email, route.params?.phone]);

  const handleSignOut = useCallback(async () => {
    await clearAppSession();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.profileContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color={whiteColor}
              />
            </TouchableOpacity>
            <Text style={styles.topTitle}>{PROFILE_TITLE}</Text>
            <View style={styles.topBarSpacer} />
          </View>
          <View style={styles.cardHero}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            </View>
            <Text style={styles.heroName}>{fullName}</Text>
            <Text style={styles.heroEmail} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <DetailRow
            icon="account-outline"
            label={PROFILE_FULL_NAME}
            value={fullName}
          />
          <View style={styles.cardDivider} />
          <DetailRow icon="email-outline" label={PROFILE_EMAIL} value={email} />
          <View style={styles.cardDivider} />
          <DetailRow
            icon="calendar-check"
            label={PROFILE_MEMBER_SINCE}
            value={PROFILE_MOCK_MEMBER_DATE}
          />
          <View style={styles.cardDivider} />
          <DetailRow
            icon="robot-outline"
            label={PROFILE_AVATARS_CREATED}
            value="2"
          />
          <View style={styles.cardDivider} />
          <DetailRow
            icon="message-text-outline"
            label={PROFILE_CONVERSATIONS}
            value="5"
          />
        </View>

        <Text style={styles.sectionLabel}>{PROFILE_APP_SECTION}</Text>
        <View style={styles.menuGroup}>
          <MenuRow
            icon="information-outline"
            label={PROFILE_ABOUT}
            showChevron
            onPress={() => { }}
          />
          <View style={styles.rowDivider} />
          <MenuRow
            icon="shield-check-outline"
            label={PROFILE_PRIVACY}
            showChevron
            onPress={() => { }}
          />
        </View>

        <AppButton
          title={PROFILE_EDIT}
          onPress={handleEditProfile}
          style={styles.editButton}
        />

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="logout"
            size={18}
            color={profileSignOutColor}
          />
          <Text style={styles.signOutText}>{PROFILE_SIGN_OUT}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const summaryShadow = {
  shadowColor: loginPrimaryPurple,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 6,
};

const styles = StyleSheet.create({
  root: {
    ...BaseStyle.flex,
    backgroundColor: profilePageBg,
  },
  scroll: {
    ...BaseStyle.flex,
  },
  scrollContent: {
    paddingBottom: spacings.ExtraLarge3x,
  },
  profileContainer: {
    backgroundColor: homeHeaderPurple,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: spacings.large,
    paddingBottom: spacings.large,
  },
  topBar: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    ...BaseStyle.justifyContentSpaceBetween,
    paddingVertical: spacings.large,
    marginBottom: spacings.medium,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: createAvatarHeaderBackBg,
    ...BaseStyle.alignJustifyCenter,
  },
  topTitle: {
    color: whiteColor,
    fontSize: style.fontSizeLargeX.fontSize,
    ...style.fontWeightMedium1x,
  },
  topBarSpacer: {
    width: 40,
  },
  summaryCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: profileSummaryBorder,
    padding: spacings.xLarge,
    margin: spacings.large,
    ...summaryShadow,
  },
  cardHero: {
    ...BaseStyle.alignItemsCenter,
    paddingBottom: spacings.xLarge,
    marginBottom: spacings.small2x,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: loginPrimaryPurple,
    marginBottom: spacings.large,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: profileRowIconBg,
    ...BaseStyle.alignJustifyCenter,
  },
  avatarInitials: {
    color: loginPrimaryPurple,
    fontSize: style.fontSizeLarge2x.fontSize,
    ...style.fontWeightMedium1x,
  },
  heroName: {
    color: whiteColor,
    fontSize: style.fontSizeLargeX.fontSize,
    ...style.fontWeightMedium1x,
    textAlign: 'center',
  },
  heroEmail: {
    color: homeHeaderPurpleLight,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightThin,
    marginTop: spacings.xsmall,
    textAlign: 'center',
    paddingHorizontal: spacings.medium,
  },
  cardDetails: {
    paddingTop: spacings.normal,
  },
  detailRow: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    ...BaseStyle.justifyContentSpaceBetween,
    paddingVertical: spacings.large,
    paddingHorizontal: spacings.xsmall,
  },
  detailLeft: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    flex: 1,
    gap: spacings.normal,
    paddingRight: spacings.medium,
  },
  detailLabel: {
    color: loginTextGrey,
    fontSize: style.fontSizeNormal.fontSize,
    ...style.fontWeightThin,
    flex: 1,
  },
  detailValue: {
    color: loginTextDark,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightMedium,
    maxWidth: '42%',
    textAlign: 'right',
  },
  cardDivider: {
    height: 1,
    backgroundColor: homeCardBorder,
  },
  sectionLabel: {
    color: loginTextGrey,
    fontSize: style.fontSizeSmall2x.fontSize,
    ...style.fontWeightMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacings.normal,
    marginLeft: spacings.large,
  },
  menuGroup: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: homeCardBorder,
    margin: spacings.large,
    overflow: 'hidden',
  },
  menuRow: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    paddingVertical: spacings.large,
    paddingHorizontal: spacings.large,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: profileRowIconBg,
    ...BaseStyle.alignJustifyCenter,
    marginRight: spacings.large,
  },
  menuIconSoft: {
    backgroundColor: profileMemberBadgeBg,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    color: loginTextGrey,
    fontSize: style.fontSizeSmall1x.fontSize,
    ...style.fontWeightThin,
  },
  menuValue: {
    color: loginTextDark,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightMedium,
    marginTop: spacings.xxsmall,
  },
  rowDivider: {
    height: 1,
    backgroundColor: homeCardBorder,
    marginLeft: spacings.large + 36 + spacings.large,
  },
  editButton: {
    margin: spacings.large,
  },
  signOutButton: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignJustifyCenter,
    paddingVertical: spacings.ExtraLarge,
    gap: spacings.normal,
    marginTop: spacings.medium,
  },
  signOutText: {
    color: profileSignOutColor,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightMedium,
  },
});
