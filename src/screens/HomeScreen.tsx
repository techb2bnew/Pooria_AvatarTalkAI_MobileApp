import React, { useCallback } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../navigation/types';
import {
  homeCardBorder,
  homeConversationIconBg,
  homeHeaderPurple,
  homeHeaderPurpleLight,
  homeRobotBlue,
  homeScreenBg,
  loginPrimaryPurple,
  loginTextDark,
  loginTextGrey,
  whiteColor,
} from '../constants/Color';
import {
  HOME_CREATE_AVATAR_SUBTITLE,
  HOME_CREATE_AVATAR_TITLE,
  HOME_GREETING,
  HOME_GREETING_SUBTITLE,
  HOME_RECENT_CONVERSATIONS,
  HOME_YOUR_AVATARS,
} from '../constants/Constants';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { heightPercentageToDP, widthPercentageToDP as wp } from '../utils';

type AvatarItem = {
  id: string;
  name: string;
  gender: string;
  avatarGender: 'male' | 'female';
  imageUri: string;
};

type ConversationItem = {
  id: string;
  name: string;
  trait: string;
  timeAgo: string;
};

const AVATARS: AvatarItem[] = [
  {
    id: '1',
    name: 'Sarah',
    gender: 'Female',
    avatarGender: 'female',
    imageUri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Alex',
    gender: 'Male',
    avatarGender: 'male',
    imageUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
];

const RECENT_CONVERSATIONS: ConversationItem[] = [
  { id: '1', name: 'Sarah', trait: 'Friendly', timeAgo: '2 hours ago' },
  { id: '2', name: 'Alex', trait: 'Professional', timeAgo: 'Yesterday' },
];

const AVATAR_CARD_WIDTH = wp(46);

type HomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const handleAvatarPress = useCallback(
    (avatar: AvatarItem) => {
      navigation.navigate('ChoosePersonality', {
        avatarId: avatar.id,
        avatarName: avatar.name,
        avatarImageUri: avatar.imageUri,
        avatarGender: avatar.avatarGender,
      });
    },
    [navigation],
  );

  const handleCreateAvatarPress = useCallback(() => {
    navigation.navigate('CreateAvatar');
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={BaseStyle.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greetingBlock}>
              <Text style={styles.greeting}>{HOME_GREETING}</Text>
              <Text style={styles.greetingSubtitle}>
                {HOME_GREETING_SUBTITLE}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              activeOpacity={0.7}
              onPress={handleProfilePress}>
              <MaterialCommunityIcons
                name="account"
                size={22}
                color={whiteColor}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.createAvatarCard}
            activeOpacity={0.85}
            onPress={handleCreateAvatarPress}>
            <View style={styles.createAvatarIconWrap}>
              <MaterialCommunityIcons name="plus" size={26} color={whiteColor} />
            </View>
            <View style={styles.createAvatarTextWrap}>
              <Text style={styles.createAvatarTitle}>
                {HOME_CREATE_AVATAR_TITLE}
              </Text>
              <Text style={styles.createAvatarSubtitle}>
                {HOME_CREATE_AVATAR_SUBTITLE}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{HOME_YOUR_AVATARS}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarList}>
            {AVATARS.map(avatar => (
              <TouchableOpacity
                key={avatar.id}
                style={styles.avatarCard}
                activeOpacity={0.8}
                onPress={() => handleAvatarPress(avatar)}>
                <Image
                  source={{ uri: avatar.imageUri }}
                  style={styles.avatarImage}
                />
                <View style={styles.avatarInfo}>
                  <View style={styles.avatarNameRow}>
                    <MaterialCommunityIcons
                      name="robot-outline"
                      size={16}
                      color={homeRobotBlue}
                    />
                    <Text style={styles.avatarName}>{avatar.name}</Text>
                  </View>
                  <Text style={styles.avatarGender}>{avatar.gender}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{HOME_RECENT_CONVERSATIONS}</Text>
          {RECENT_CONVERSATIONS.map(conversation => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationCard}
              activeOpacity={0.8}>
              <View style={styles.conversationIconWrap}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={22}
                  color={loginPrimaryPurple}
                />
              </View>
              <View style={styles.conversationInfo}>
                <Text style={styles.conversationName}>
                  {conversation.name}
                </Text>
                <Text style={styles.conversationTrait}>
                  {conversation.trait}
                </Text>
              </View>
              <View style={styles.conversationTimeWrap}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={loginTextGrey}
                />
                <Text style={styles.conversationTime}>
                  {conversation.timeAgo}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

const styles = StyleSheet.create({
  safeArea: {
    ...BaseStyle.flex,
    backgroundColor: homeScreenBg,
  },
  scrollContent: {
    paddingBottom: spacings.ExtraLarge2x,
  },
  header: {
    backgroundColor: homeHeaderPurple,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: spacings.large,
    paddingTop: spacings.xxLarge,
    height: heightPercentageToDP(20),
  },
  headerContent: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsFlexStart,
    ...BaseStyle.justifyContentSpaceBetween,
  },
  greetingBlock: {
    flex: 1,
    paddingRight: spacings.large,
  },
  greeting: {
    color: whiteColor,
    fontSize: style.fontSizeLargeXX.fontSize,
    ...style.fontWeightMedium1x,
  },
  greetingSubtitle: {
    color: homeHeaderPurpleLight,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightThin,
    marginTop: spacings.xsmall,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: homeHeaderPurpleLight,
    ...BaseStyle.alignJustifyCenter,
  },
  createAvatarCard: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    backgroundColor: whiteColor,
    padding: spacings.xLarge,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: homeCardBorder,
    ...cardShadow,
    marginTop: spacings.xxLarge,
  },
  createAvatarIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: loginPrimaryPurple,
    ...BaseStyle.alignJustifyCenter,
    marginRight: spacings.large,
  },
  createAvatarTextWrap: {
    flex: 1,
  },
  createAvatarTitle: {
    color: loginTextDark,
    fontSize: style.fontSizeMedium1x.fontSize,
    ...style.fontWeightMedium1x,
  },
  createAvatarSubtitle: {
    color: loginTextGrey,
    fontSize: style.fontSizeNormal.fontSize,
    ...style.fontWeightThin,
    marginTop: spacings.xxsmall,
  },
  section: {
    marginTop: spacings.ExtraLarge,
    paddingHorizontal: spacings.large,
  },
  sectionTitle: {
    color: loginTextDark,
    fontSize: style.fontSizeMedium1x.fontSize,
    ...style.fontWeightMedium1x,
    marginBottom: spacings.large,
  },
  avatarList: {
    gap: spacings.large,
    paddingRight: spacings.ExtraLarge2x,
  },
  avatarCard: {
    width: AVATAR_CARD_WIDTH,
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: homeCardBorder,
    overflow: 'hidden',
    ...cardShadow,
  },
  avatarImage: {
    width: '100%',
    height: AVATAR_CARD_WIDTH,
    ...BaseStyle.resizeModeCover,
  },
  avatarInfo: {
    padding: spacings.large,
  },
  avatarNameRow: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    gap: spacings.xsmall,
  },
  avatarName: {
    color: loginTextDark,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightMedium1x,
  },
  avatarGender: {
    color: loginTextGrey,
    fontSize: style.fontSizeSmall1x.fontSize,
    ...style.fontWeightThin,
    marginTop: spacings.xxsmall,
  },
  conversationCard: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: homeCardBorder,
    padding: spacings.large,
    marginBottom: spacings.large,
    ...cardShadow,
  },
  conversationIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: homeConversationIconBg,
    ...BaseStyle.alignJustifyCenter,
    marginRight: spacings.large,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    color: loginTextDark,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightMedium1x,
  },
  conversationTrait: {
    color: loginTextGrey,
    fontSize: style.fontSizeSmall1x.fontSize,
    ...style.fontWeightThin,
    marginTop: spacings.xxsmall,
  },
  conversationTimeWrap: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    gap: spacings.xxsmall,
  },
  conversationTime: {
    color: loginTextGrey,
    fontSize: style.fontSizeSmall1x.fontSize,
    ...style.fontWeightThin,
  },
});
