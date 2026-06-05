import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { normalizeAvatarGender } from '../constants/avatar3dConfig';
import { loginTextGrey, whiteColor } from '../constants/Color';
import {
  AvatarEmotionId,
  getPersonalityConfig,
} from '../constants/personalityAvatar';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';

type NativeHumanoidAvatarProps = {
  faceImageUri: string;
  avatarGender: string;
  personalityId: string;
  emotion: AvatarEmotionId;
  isListening?: boolean;
  isTalking?: boolean;
};

const CARD_W = 268;
const CARD_H = 430;
const FACE = 132;

/** Works offline — no WebView, no npm start needed for rendering */
const NativeHumanoidAvatar = ({
  faceImageUri,
  avatarGender,
  personalityId,
  isListening = false,
  isTalking = false,
}: NativeHumanoidAvatarProps) => {
  const config = getPersonalityConfig(personalityId);
  const gender = normalizeAvatarGender(avatarGender);
  const bounce = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0.5)).current;
  const talkPulse = useRef(new Animated.Value(1)).current;
  const [imageError, setImageError] = React.useState(false);

  useEffect(() => {
    const idle = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    idle.start();
    return () => idle.stop();
  }, [bounce]);

  useEffect(() => {
    if (!isListening) {
      ring.setValue(0.55);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 0.35, duration: 600, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isListening, ring]);

  useEffect(() => {
    if (!isTalking) {
      talkPulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(talkPulse, { toValue: 1.04, duration: 130, useNativeDriver: true }),
        Animated.timing(talkPulse, { toValue: 0.99, duration: 130, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isTalking, talkPulse]);

  const floatY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const shirt = config.accentColor;
  const shirtDark = `${shirt}DD`;
  const pants = gender === 'female' ? '#4A5568' : '#3F4A5C';
  const shoe = '#1F2937';
  const skin = '#E8B89A';

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.card,
          { borderColor: shirt, transform: [{ translateY: floatY }] },
        ]}>
        {isListening ? (
          <Animated.View
            style={[styles.listenRing, { borderColor: shirt, opacity: ring }]}
          />
        ) : null}

        <View style={styles.stageFloor}>
          <View style={styles.floorShadow} />
        </View>

        <View style={styles.fullBody}>
          <Animated.View
            style={[
              styles.faceOuter,
              { borderColor: shirt, transform: [{ scale: isTalking ? talkPulse : 1 }] },
            ]}>
            <View style={styles.faceInner}>
              {!imageError && faceImageUri ? (
                <Image
                  source={{ uri: faceImageUri }}
                  style={styles.faceImage}
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={styles.facePlaceholder}>
                  <MaterialCommunityIcons
                    name={gender === 'female' ? 'face-woman' : 'face-man'}
                    size={64}
                    color={loginTextGrey}
                  />
                </View>
              )}
            </View>
            {isTalking ? <View style={styles.mouthHint} /> : null}
          </Animated.View>

          <View style={[styles.neck, { backgroundColor: skin }]} />

          <View style={styles.upperBody}>
            <View style={[styles.arm, styles.armLeft, { backgroundColor: shirtDark }]}>
              <View style={[styles.hand, { backgroundColor: skin }]} />
            </View>
            <View style={[styles.chest, { backgroundColor: shirt }]}>
              <View style={[styles.collar, { borderColor: whiteColor }]} />
            </View>
            <View style={[styles.arm, styles.armRight, { backgroundColor: shirtDark }]}>
              <View style={[styles.hand, { backgroundColor: skin }]} />
            </View>
          </View>

          <View style={[styles.hips, { backgroundColor: pants }]} />
          <View style={styles.legsRow}>
            <View style={styles.legCol}>
              <View style={[styles.leg, { backgroundColor: pants }]} />
              <View style={[styles.shoe, { backgroundColor: shoe }]} />
            </View>
            <View style={styles.legGap} />
            <View style={styles.legCol}>
              <View style={[styles.leg, { backgroundColor: pants }]} />
              <View style={[styles.shoe, { backgroundColor: shoe }]} />
            </View>
          </View>
        </View>
      </Animated.View>

      {isListening ? (
        <View style={[styles.badge, { backgroundColor: shirt }]}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Listening</Text>
        </View>
      ) : isTalking ? (
        <View style={[styles.badge, { backgroundColor: shirt }]}>
          <Text style={styles.badgeText}>Speaking</Text>
        </View>
      ) : (
        <Text style={styles.modeLabel}>
          {gender === 'female' ? 'Female' : 'Male'} · 2D avatar
        </Text>
      )}
    </View>
  );
};

export default NativeHumanoidAvatar;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    ...BaseStyle.alignItemsCenter,
    marginVertical: spacings.normal,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    backgroundColor: '#F6F8FB',
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 10,
  },
  listenRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 3,
    margin: 2,
    zIndex: 10,
  },
  stageFloor: {
    position: 'absolute',
    bottom: 28,
    width: '100%',
    ...BaseStyle.alignItemsCenter,
  },
  floorShadow: {
    width: 140,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  fullBody: {
    flex: 1,
    ...BaseStyle.alignItemsCenter,
    paddingTop: 14,
    paddingBottom: 36,
  },
  faceOuter: {
    width: FACE,
    height: FACE,
    borderRadius: FACE / 2,
    borderWidth: 4,
    backgroundColor: whiteColor,
    zIndex: 5,
  },
  faceInner: {
    flex: 1,
    margin: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  faceImage: {
    width: '100%',
    height: '100%',
    ...BaseStyle.resizeModeCover,
  },
  facePlaceholder: {
    flex: 1,
    ...BaseStyle.alignJustifyCenter,
    backgroundColor: '#eef0f4',
  },
  mouthHint: {
    position: 'absolute',
    bottom: FACE * 0.22,
    alignSelf: 'center',
    width: 32,
    height: 7,
    borderRadius: 5,
    backgroundColor: 'rgba(30, 25, 40, 0.4)',
  },
  neck: {
    width: 38,
    height: 22,
    borderRadius: 8,
    marginTop: -4,
  },
  upperBody: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsFlexEnd,
    marginTop: -2,
  },
  arm: {
    width: 26,
    height: 88,
    borderRadius: 14,
    ...BaseStyle.alignItemsCenter,
    justifyContent: 'flex-end',
  },
  armLeft: { marginRight: -4, transform: [{ rotate: '4deg' }] },
  armRight: { marginLeft: -4, transform: [{ rotate: '-4deg' }] },
  hand: { width: 22, height: 22, borderRadius: 11 },
  chest: {
    width: 82,
    height: 96,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    ...BaseStyle.alignItemsCenter,
  },
  collar: {
    width: 44,
    height: 18,
    borderRadius: 10,
    borderWidth: 3,
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  hips: {
    width: 92,
    height: 28,
    borderRadius: 10,
    marginTop: -2,
  },
  legsRow: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsFlexStart,
  },
  legCol: { ...BaseStyle.alignItemsCenter },
  legGap: { width: 14 },
  leg: {
    width: 30,
    height: 108,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  shoe: { width: 38, height: 16, borderRadius: 8, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacings.large,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.small2x,
    borderRadius: 16,
    gap: spacings.small2x,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: whiteColor,
  },
  badgeText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    ...style.fontWeightMedium,
  },
  modeLabel: {
    marginTop: spacings.small2x,
    color: loginTextGrey,
    fontSize: style.fontSizeSmall.fontSize,
  },
});
