import React, { useCallback, useEffect, useState } from 'react';
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
import HumanoidAvatarView from '../components/HumanoidAvatarView';
import { useAvatarVoiceTalk } from '../hooks/useAvatarVoiceTalk';
import {
  homeCardBorder,
  homeHeaderPurple,
  homeScreenBg,
  loginTextDark,
  loginTextGrey,
  loginPrimaryPurple,
  personalityFriendlyGreen,
  whiteColor,
} from '../constants/Color';
import {
  AVATAR_TALK_AVATAR_LABEL,
  AVATAR_TALK_CHANGE_SETUP,
  AVATAR_TALK_LISTENING,
  AVATAR_TALK_MODE_SUFFIX,
  AVATAR_TALK_SPEAKING,
  AVATAR_TALK_TAP_SPEAK,
  AVATAR_TALK_TAP_STOP,
  AVATAR_TALK_TAP_STOP_VOICE,
  AVATAR_TALK_THINKING,
  AVATAR_TALK_TYPING_HINT,
  AVATAR_TALK_YOU_LABEL,
} from '../constants/Constants';
import { getPersonalityConfig } from '../constants/personalityAvatar';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'AvatarTalk'>;

const formatTimer = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const AvatarTalkScreen = ({ navigation, route }: Props) => {
  const {
    avatarName,
    avatarImageUri,
    avatarGender: routeGender,
    personalityId,
    personalityTitle,
  } = route.params;
  const avatarGender = routeGender || 'male';
  const accent = getPersonalityConfig(personalityId).accentColor;
  const [elapsed, setElapsed] = useState(0);

  const {
    emotion,
    liveTranscript,
    avatarReplyText,
    showTranscriptBox,
    isListening,
    isTalking,
    isProcessing,
    isBusy,
    toggleMic,
    endSession,
  } = useAvatarVoiceTalk({ personalityId, avatarName });

  useEffect(() => {
    const t = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const leave = useCallback(() => {
    void endSession().then(() => navigation.navigate('Home'));
  }, [endSession, navigation.navigate]);

  const youDisplay = liveTranscript.trim()
    ? liveTranscript
    : isListening
      ? AVATAR_TALK_TYPING_HINT
      : '';

  const micHint = isTalking
    ? AVATAR_TALK_TAP_STOP_VOICE
    : isListening
      ? AVATAR_TALK_TAP_STOP
      : isProcessing
        ? AVATAR_TALK_THINKING
        : AVATAR_TALK_TAP_SPEAK;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={leave}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={loginTextDark}
            />
          </TouchableOpacity>
          <View style={styles.timerPill}>
            {(isListening || isTalking) && <View style={styles.liveDot} />}
            <Text style={styles.timerText}>{formatTimer(elapsed)}</Text>
          </View>
        </View>

        <ScrollView
          style={BaseStyle.flex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.avatarSection}>
            <HumanoidAvatarView
              faceImageUri={avatarImageUri}
              avatarGender={avatarGender}
              personalityId={personalityId}
              emotion={emotion}
              isListening={isListening}
              isTalking={isTalking}
            />
          </View>

          <Text style={styles.name}>{avatarName}</Text>
          <View style={styles.modePill}>
            <Text style={styles.modeText}>
              {personalityTitle} {AVATAR_TALK_MODE_SUFFIX}
            </Text>
          </View>

          {showTranscriptBox ? (
            <View style={styles.transcriptCard}>
              <Text style={styles.transcriptLabel}>{AVATAR_TALK_YOU_LABEL}</Text>
              <Text
                style={[
                  styles.transcriptText,
                  !liveTranscript.trim() && isListening && styles.transcriptHint,
                ]}>
                {youDisplay}
              </Text>
              {isListening ? (
                <Text style={styles.liveIndicator}>{AVATAR_TALK_LISTENING}</Text>
              ) : null}

              {(isProcessing || isTalking) && avatarReplyText ? (
                <View style={styles.replyBlock}>
                  <Text style={[styles.transcriptLabel, { color: accent }]}>
                    {AVATAR_TALK_AVATAR_LABEL}
                  </Text>
                  <Text style={styles.replyText}>{avatarReplyText}</Text>
                  {isTalking ? (
                    <Text style={styles.liveIndicator}>
                      {AVATAR_TALK_SPEAKING}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.micSection}>
          <TouchableOpacity
            style={[styles.micBtn, isListening && styles.micActive]}
            onPress={toggleMic}
            disabled={isBusy && !isListening && !isTalking}
            activeOpacity={0.85}>
            <MaterialCommunityIcons
              name={isListening ? 'microphone' : 'microphone-outline'}
              size={36}
              color={whiteColor}
            />
          </TouchableOpacity>
          <Text style={styles.micHint}>{micHint}</Text>
        </View>

        <TouchableOpacity style={styles.changeSetupBtn} onPress={leave}>
          <MaterialCommunityIcons
            name="account-switch-outline"
            size={22}
            color={whiteColor}
          />
          <Text style={styles.changeSetupText}>
            {AVATAR_TALK_CHANGE_SETUP}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default AvatarTalkScreen;

const styles = StyleSheet.create({
  root: { ...BaseStyle.flex, backgroundColor: homeScreenBg },
  safe: { ...BaseStyle.flex, paddingHorizontal: spacings.large },
  scroll: {
    paddingBottom: spacings.large,
    ...BaseStyle.alignItemsCenter,
    flexGrow: 1,
  },
  avatarSection: {
    width: '100%',
    ...BaseStyle.alignItemsCenter,
    marginTop: spacings.small2x,
  },
  topBar: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    ...BaseStyle.justifyContentSpaceBetween,
    paddingTop: spacings.normal,
    marginBottom: spacings.normal,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: whiteColor,
    ...BaseStyle.alignJustifyCenter,
    elevation: 3,
  },
  timerPill: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    backgroundColor: whiteColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    borderRadius: 24,
    gap: spacings.small2x,
    elevation: 3,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: personalityFriendlyGreen,
  },
  timerText: {
    color: loginTextDark,
    fontSize: style.fontSizeNormal.fontSize,
    ...style.fontWeightMedium,
  },
  name: {
    marginTop: spacings.normal,
    color: loginTextDark,
    fontSize: style.fontSizeLargeX.fontSize,
    ...style.fontWeightMedium1x,
  },
  modePill: {
    marginTop: spacings.small2x,
    paddingHorizontal: spacings.xLarge,
    paddingVertical: spacings.small2x,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: homeCardBorder,
    marginBottom: spacings.large,
  },
  modeText: {
    color: loginTextGrey,
    fontSize: style.fontSizeSmall1x.fontSize,
    ...style.fontWeightThin,
  },
  transcriptCard: {
    width: '100%',
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: homeCardBorder,
    padding: spacings.large,
    minHeight: 120,
  },
  transcriptLabel: {
    color: loginTextGrey,
    fontSize: style.fontSizeSmall1x.fontSize,
    ...style.fontWeightMedium,
    marginBottom: spacings.small2x,
  },
  transcriptText: {
    color: loginTextDark,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightMedium1x,
    lineHeight: style.fontSizeLarge2x.fontSize,
  },
  transcriptHint: {
    color: loginTextGrey,
    fontSize: style.fontSizeNormal.fontSize,
    ...style.fontWeightThin,
    fontStyle: 'italic',
  },
  liveIndicator: {
    marginTop: spacings.normal,
    color: personalityFriendlyGreen,
    fontSize: style.fontSizeSmall1x.fontSize,
    ...style.fontWeightMedium,
  },
  replyBlock: {
    marginTop: spacings.xLarge,
    paddingTop: spacings.large,
    borderTopWidth: 1,
    borderTopColor: homeCardBorder,
  },
  replyText: {
    color: loginTextDark,
    fontSize: style.fontSizeNormal.fontSize,
    ...style.fontWeightThin,
    lineHeight: style.fontSizeLarge.fontSize,
  },
  micSection: {
    ...BaseStyle.alignItemsCenter,
    paddingVertical: spacings.normal,
  },
  micBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: homeHeaderPurple,
    ...BaseStyle.alignJustifyCenter,
  },
  micActive: { transform: [{ scale: 1.06 }] },
  micHint: {
    marginTop: spacings.normal,
    color: loginTextGrey,
    fontSize: style.fontSizeNormal.fontSize,
    ...style.fontWeightThin,
  },
  changeSetupBtn: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    ...BaseStyle.justifyContentCenter,
    backgroundColor: loginPrimaryPurple,
    borderRadius: 28,
    paddingVertical: spacings.xLarge,
    gap: spacings.normal,
    marginBottom: spacings.normal,
  },
  changeSetupText: {
    color: whiteColor,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightMedium1x,
  },
});
