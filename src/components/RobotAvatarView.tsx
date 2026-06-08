import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { loginTextGrey, whiteColor } from '../constants/Color';
import {
  AvatarEmotionId,
  getPersonalityConfig,
} from '../constants/personalityAvatar';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';

type RobotAvatarViewProps = {
  personalityId: string;
  emotion: AvatarEmotionId;
  isListening?: boolean;
  isTalking?: boolean;
};

const HEAD = 148;

const RobotAvatarView = ({
  personalityId,
  isListening = false,
  isTalking = false,
}: RobotAvatarViewProps) => {
  const config = getPersonalityConfig(personalityId);
  const accent = config.accentColor;
  const bounce = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0.5)).current;
  const mouth = useRef(new Animated.Value(0)).current;
  const eyeGlow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const idle = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 2000,
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
      mouth.setValue(0);
      return;
    }
    const talk = Animated.loop(
      Animated.sequence([
        Animated.timing(mouth, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(mouth, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]),
    );
    talk.start();
    return () => talk.stop();
  }, [isTalking, mouth]);

  useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(eyeGlow, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(eyeGlow, { toValue: 0.45, duration: 1400, useNativeDriver: true }),
      ]),
    );
    glow.start();
    return () => glow.stop();
  }, [eyeGlow]);

  const floatY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const mouthH = mouth.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 18],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.card,
          { borderColor: accent, transform: [{ translateY: floatY }] },
        ]}>
        {isListening ? (
          <Animated.View
            style={[styles.listenRing, { borderColor: accent, opacity: ring }]}
          />
        ) : null}

        <View style={styles.antenna}>
          <View style={[styles.antennaStick, { backgroundColor: accent }]} />
          <View style={[styles.antennaBall, { backgroundColor: accent }]} />
        </View>

        <View style={[styles.head, { borderColor: accent }]}>
          <View style={styles.headInner}>
            <View style={styles.visor}>
              <Animated.View style={[styles.eye, { opacity: eyeGlow }]}>
                <View style={[styles.eyeCore, { backgroundColor: accent }]} />
              </Animated.View>
              <Animated.View style={[styles.eye, { opacity: eyeGlow }]}>
                <View style={[styles.eyeCore, { backgroundColor: accent }]} />
              </Animated.View>
            </View>

            <View style={styles.mouthRow}>
              <Animated.View
                style={[
                  styles.mouth,
                  { backgroundColor: accent, height: mouthH },
                ]}
              />
            </View>

            <View style={styles.chinGrill}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.grillLine, { backgroundColor: accent }]} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.neck}>
          <View style={[styles.neckRing, { borderColor: accent }]} />
          <View style={[styles.neckRing, styles.neckRingMid, { borderColor: accent }]} />
        </View>

        <View style={[styles.body, { backgroundColor: `${accent}22`, borderColor: accent }]}>
          <MaterialCommunityIcons name="robot" size={42} color={accent} />
        </View>
      </Animated.View>

      {isListening ? (
        <View style={[styles.badge, { backgroundColor: accent }]}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Listening</Text>
        </View>
      ) : isTalking ? (
        <View style={[styles.badge, { backgroundColor: accent }]}>
          <Text style={styles.badgeText}>Speaking</Text>
        </View>
      ) : (
        <Text style={styles.modeLabel}>AI Robot</Text>
      )}
    </View>
  );
};

export default RobotAvatarView;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    ...BaseStyle.alignItemsCenter,
    marginVertical: spacings.normal,
  },
  card: {
    width: 260,
    minHeight: 340,
    borderRadius: 24,
    backgroundColor: '#EEF2F8',
    borderWidth: 2,
    ...BaseStyle.alignItemsCenter,
    paddingTop: spacings.normal,
    paddingBottom: spacings.xLarge,
    elevation: 8,
  },
  listenRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 3,
    margin: 2,
    zIndex: 10,
  },
  antenna: {
    ...BaseStyle.alignItemsCenter,
    marginBottom: spacings.small2x,
  },
  antennaStick: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  antennaBall: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: -2,
  },
  head: {
    width: HEAD,
    height: HEAD,
    borderRadius: 28,
    borderWidth: 4,
    backgroundColor: '#D9E2EC',
    padding: 8,
  },
  headInner: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    paddingTop: 22,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  visor: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.justifyContentSpaceBetween,
    paddingHorizontal: 8,
  },
  eye: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#64748B',
    ...BaseStyle.alignJustifyCenter,
  },
  eyeCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  mouthRow: {
    marginTop: 18,
    ...BaseStyle.alignItemsCenter,
    minHeight: 22,
    justifyContent: 'center',
  },
  mouth: {
    width: 44,
    borderRadius: 8,
    minHeight: 6,
  },
  chinGrill: {
    marginTop: 14,
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.justifyContentCenter,
    gap: 6,
  },
  grillLine: {
    width: 4,
    height: 14,
    borderRadius: 2,
    opacity: 0.7,
  },
  neck: {
    ...BaseStyle.alignItemsCenter,
    marginTop: spacings.small2x,
    gap: 4,
  },
  neckRing: {
    width: 36,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: '#94A3B8',
  },
  neckRingMid: {
    width: 28,
    height: 8,
  },
  body: {
    marginTop: spacings.normal,
    width: 110,
    height: 72,
    borderRadius: 18,
    borderWidth: 2,
    ...BaseStyle.alignJustifyCenter,
  },
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
