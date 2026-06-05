import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { getReadyPlayerMeUrl } from '../config/rpmAvatarUrls';
import { normalizeAvatarGender } from '../constants/avatar3dConfig';
import { loginTextGrey, whiteColor } from '../constants/Color';
import { AVATAR_TALK_LOADING_3D } from '../constants/Constants';
import {
  AvatarEmotionId,
  getPersonalityConfig,
} from '../constants/personalityAvatar';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { buildHumanoid3DHtml } from './humanoid3dHtml';

type HumanoidAvatar3DProps = {
  faceImageUri: string;
  avatarGender: string;
  personalityId: string;
  emotion: AvatarEmotionId;
  isListening?: boolean;
  isTalking?: boolean;
  onLoadFailed?: () => void;
};

const CARD_W = 300;
const CARD_H = 420;

const HumanoidAvatar3D = ({
  avatarGender,
  personalityId,
  emotion,
  isListening = false,
  isTalking = false,
  onLoadFailed,
}: HumanoidAvatar3DProps) => {
  const config = getPersonalityConfig(personalityId);
  const gender = normalizeAvatarGender(avatarGender);
  const hasRpm = Boolean(getReadyPlayerMeUrl(gender));
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [webKey, setWebKey] = useState(0);
  const ring = useRef(new Animated.Value(0.5)).current;
  const failedRef = useRef(false);

  const html = useMemo(
    () =>
      buildHumanoid3DHtml({
        avatarGender,
        personalityId,
        accentColor: config.accentColor,
      }),
    [avatarGender, personalityId, config.accentColor],
  );

  const sendCommand = useCallback(
    (payload: Record<string, unknown>) => {
      if (!webRef.current || !ready) {
        return;
      }
      webRef.current.injectJavaScript(
        `window.handleAvatarCommand(${JSON.stringify(JSON.stringify(payload))}); true;`,
      );
    },
    [ready],
  );

  const triggerFail = useCallback(() => {
    if (failedRef.current) {
      return;
    }
    failedRef.current = true;
    setLoadError(true);
    setReady(false);
    onLoadFailed?.();
  }, [onLoadFailed]);

  useEffect(() => {
    failedRef.current = false;
    setReady(false);
    setLoadError(false);
  }, [personalityId, avatarGender, html, webKey]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    sendCommand({ type: 'emotion', emotion });
    sendCommand({ type: 'talking', active: isTalking });
    sendCommand({ type: 'accent', color: config.accentColor });
  }, [ready, emotion, isTalking, config.accentColor, sendCommand]);

  useEffect(() => {
    if (!isListening || !ready) {
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
  }, [isListening, ready, ring]);

  const onWebMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as { type?: string };
        if (data.type === 'ready') {
          setReady(true);
          setLoadError(false);
        }
        if (data.type === 'error') {
          triggerFail();
        }
      } catch {
        // ignore
      }
    },
    [triggerFail],
  );

  const retryLoad = useCallback(() => {
    failedRef.current = false;
    setReady(false);
    setLoadError(false);
    setWebKey((k) => k + 1);
  }, []);

  const genderLabel = gender === 'female' ? 'Female 3D' : 'Male 3D';

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { borderColor: config.accentColor }]}>
        {isListening && ready ? (
          <Animated.View
            style={[
              styles.listenRing,
              { borderColor: config.accentColor, opacity: ring },
            ]}
          />
        ) : null}

        {!ready && !loadError ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={config.accentColor} />
            <Text style={styles.loaderText}>{AVATAR_TALK_LOADING_3D}</Text>
          </View>
        ) : null}

        {loadError ? (
          <View style={styles.loader}>
            <MaterialCommunityIcons
              name="human-greeting-variant"
              size={56}
              color={loginTextGrey}
            />
            <Text style={styles.loaderText}>3D loading… switching to 2D</Text>
          </View>
        ) : null}

        {!loadError ? (
          <WebView
            key={webKey}
            ref={webRef}
            source={{ html, baseUrl: 'https://cdn.jsdelivr.net' }}
            style={[styles.webview, !ready && styles.webviewHidden]}
            scrollEnabled={false}
            bounces={false}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            onMessage={onWebMessage}
            onError={triggerFail}
            onHttpError={triggerFail}
            mixedContentMode="always"
            androidLayerType="hardware"
          />
        ) : null}
      </View>

      {isListening ? (
        <View style={[styles.badge, { backgroundColor: config.accentColor }]}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Listening</Text>
        </View>
      ) : isTalking ? (
        <View style={[styles.badge, { backgroundColor: config.accentColor }]}>
          <Text style={styles.badgeText}>Speaking</Text>
        </View>
      ) : ready ? (
        <Text style={styles.meta}>
          {genderLabel} · {hasRpm ? 'Ready Player Me' : '3D'}
        </Text>
      ) : loadError ? (
        <TouchableOpacity onPress={retryLoad}>
          <Text style={styles.meta}>Retry 3D</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default HumanoidAvatar3D;

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
    backgroundColor: '#EEF2F8',
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
  webview: { flex: 1, backgroundColor: 'transparent' },
  webviewHidden: { opacity: 0.01 },
  loader: {
    ...StyleSheet.absoluteFillObject,
    ...BaseStyle.alignJustifyCenter,
    padding: spacings.large,
    zIndex: 5,
    backgroundColor: '#EEF2F8',
  },
  loaderText: {
    marginTop: spacings.normal,
    color: loginTextGrey,
    fontSize: style.fontSizeSmall1x.fontSize,
    textAlign: 'center',
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
  meta: {
    marginTop: spacings.small2x,
    color: loginTextGrey,
    fontSize: style.fontSizeSmall.fontSize,
  },
});
