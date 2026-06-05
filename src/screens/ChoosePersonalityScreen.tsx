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
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CHOOSE_PERSONALITY_SUBTITLE,
  CHOOSE_PERSONALITY_TITLE,
  PERSONALITY_ANGRY,
  PERSONALITY_ANGRY_DESC,
  PERSONALITY_FRIENDLY,
  PERSONALITY_FRIENDLY_DESC,
  PERSONALITY_FUNNY,
  PERSONALITY_FUNNY_DESC,
  PERSONALITY_MOTIVATIONAL,
  PERSONALITY_MOTIVATIONAL_DESC,
  PERSONALITY_NORMAL,
  PERSONALITY_NORMAL_DESC,
  PERSONALITY_PROFESSIONAL,
  PERSONALITY_PROFESSIONAL_DESC,
} from '../constants/Constants';
import {
  homeScreenBg,
  loginTextDark,
  loginTextGrey,
  personalityAngryRed,
  personalityBackButtonBg,
  personalityFriendlyGreen,
  personalityFunnyOrange,
  personalityIconBgOverlay,
  personalityMotivationalPurple,
  personalityNormalGrey,
  personalityProfessionalBlue,
  whiteColor,
} from '../constants/Color';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { AuthStackParamList } from '../navigation/types';
import { saveAvatarAndPersonality } from '../services/sessionStorage';

type PersonalityOption = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  backgroundColor: string;
  iconName: string;
};

const PERSONALITIES: PersonalityOption[] = [
  {
    id: 'friendly',
    title: PERSONALITY_FRIENDLY,
    description: PERSONALITY_FRIENDLY_DESC,
    emoji: '😊',
    backgroundColor: personalityFriendlyGreen,
    iconName: 'emoticon-happy-outline',
  },
  {
    id: 'normal',
    title: PERSONALITY_NORMAL,
    description: PERSONALITY_NORMAL_DESC,
    emoji: '😐',
    backgroundColor: personalityNormalGrey,
    iconName: 'emoticon-neutral-outline',
  },
  {
    id: 'angry',
    title: PERSONALITY_ANGRY,
    description: PERSONALITY_ANGRY_DESC,
    emoji: '😡',
    backgroundColor: personalityAngryRed,
    iconName: 'emoticon-angry-outline',
  },
  {
    id: 'funny',
    title: PERSONALITY_FUNNY,
    description: PERSONALITY_FUNNY_DESC,
    emoji: '😂',
    backgroundColor: personalityFunnyOrange,
    iconName: 'emoticon-excited-outline',
  },
  {
    id: 'professional',
    title: PERSONALITY_PROFESSIONAL,
    description: PERSONALITY_PROFESSIONAL_DESC,
    emoji: '💼',
    backgroundColor: personalityProfessionalBlue,
    iconName: 'briefcase-outline',
  },
  {
    id: 'motivational',
    title: PERSONALITY_MOTIVATIONAL,
    description: PERSONALITY_MOTIVATIONAL_DESC,
    emoji: '💪',
    backgroundColor: personalityMotivationalPurple,
    iconName: 'lightning-bolt-outline',
  },
];

type ChoosePersonalityScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ChoosePersonality'
>;

const ChoosePersonalityScreen = ({
  navigation,
  route,
}: ChoosePersonalityScreenProps) => {
  const { avatarId, avatarName, avatarImageUri, avatarGender } = route.params;

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectPersonality = useCallback(
    async (personalityId: string, personalityTitle: string) => {
      await saveAvatarAndPersonality(
        { avatarId, avatarName, avatarImageUri, avatarGender },
        { personalityId, personalityTitle },
      );
      navigation.navigate('AvatarTalk', {
        avatarId,
        avatarName,
        avatarImageUri,
        avatarGender,
        personalityId,
        personalityTitle,
      });
    },
    [navigation, avatarId, avatarName, avatarImageUri, avatarGender],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={loginTextDark}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{CHOOSE_PERSONALITY_TITLE}</Text>
      </View>

      <Text style={styles.subtitle}>{CHOOSE_PERSONALITY_SUBTITLE}</Text>

      <ScrollView
        style={BaseStyle.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {PERSONALITIES.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.personalityCard, { backgroundColor: item.backgroundColor }]}
            onPress={() => handleSelectPersonality(item.id, item.title)}
            activeOpacity={0.85}>
            <View style={styles.emojiWrap}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
            <MaterialCommunityIcons
              name={item.iconName}
              size={28}
              color={whiteColor}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChoosePersonalityScreen;

const styles = StyleSheet.create({
  safeArea: {
    ...BaseStyle.flex,
    backgroundColor: homeScreenBg,
  },
  header: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    paddingHorizontal: spacings.large,
    paddingTop: spacings.large,
    gap: spacings.large,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: personalityBackButtonBg,
    ...BaseStyle.alignJustifyCenter,
  },
  title: {
    flex: 1,
    color: loginTextDark,
    fontSize: style.fontSizeLargeX.fontSize,
    ...style.fontWeightMedium1x,
  },
  subtitle: {
    color: loginTextGrey,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightThin,
    paddingHorizontal: spacings.large,
    marginTop: spacings.small2x,
    marginBottom: spacings.ExtraLarge,
    lineHeight: style.fontSizeLarge.fontSize,
  },
  scrollContent: {
    paddingHorizontal: spacings.large,
    paddingBottom: spacings.ExtraLarge2x,
    gap: spacings.large,
  },
  personalityCard: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    borderRadius: 16,
    padding: spacings.large,
    minHeight: 88,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: personalityIconBgOverlay,
    ...BaseStyle.alignJustifyCenter,
    marginRight: spacings.large,
  },
  emoji: {
    fontSize: style.fontSizeLarge2x.fontSize,
  },
  cardTextWrap: {
    flex: 1,
    paddingRight: spacings.medium,
  },
  cardTitle: {
    color: whiteColor,
    fontSize: style.fontSizeMedium1x.fontSize,
    ...style.fontWeightMedium1x,
    marginBottom: spacings.xxsmall,
  },
  cardDescription: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    ...style.fontWeightThin,
    opacity: 0.92,
  },
});
