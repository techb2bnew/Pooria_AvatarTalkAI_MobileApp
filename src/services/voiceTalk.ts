import { PermissionsAndroid, Platform } from 'react-native';
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { AVATAR_TALK_MIC_DENIED } from '../constants/Constants';
import {
  PERSONALITY_TTS,
  PersonalityTtsProfile,
} from '../utils/personalityVoiceReply';
import { PersonalityId, isPersonalityId } from '../constants/personalityAvatar';
import { forceMainSpeaker } from './iosAudioSession';

export type VoiceTalkPhase = 'idle' | 'listening' | 'processing' | 'speaking';

type VoiceListenerHandlers = {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onListenEnd: () => void;
  onError: (event: SpeechErrorEvent) => void;
  onSpeechStarted?: () => void;
};

let ttsSubscriptions: Array<{ remove: () => void }> = [];
let activeSpeakGeneration = 0;
let voiceHandlers: VoiceListenerHandlers | null = null;

const clearTtsListeners = () => {
  ttsSubscriptions.forEach((sub) => sub.remove());
  ttsSubscriptions = [];
};

const applyVoiceHandlers = () => {
  if (!voiceHandlers) {
    return;
  }
  Voice.onSpeechStart = () => voiceHandlers?.onSpeechStarted?.();
  Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
    const value = pickBestResult(e.value);
    if (value) {
      voiceHandlers?.onPartial(value);
    }
  };
  Voice.onSpeechResults = (e: SpeechResultsEvent) => {
    const value = pickBestResult(e.value);
    if (value) {
      voiceHandlers?.onFinal(value);
    }
  };
  Voice.onSpeechEnd = () => voiceHandlers?.onListenEnd();
  Voice.onSpeechError = (e: SpeechErrorEvent) => voiceHandlers?.onError(e);
};

export const requestMicPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }
  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  const alreadyGranted = await PermissionsAndroid.check(permission);
  if (alreadyGranted) {
    return true;
  }
  const granted = await PermissionsAndroid.request(permission, {
    title: 'Microphone',
    message: AVATAR_TALK_MIC_DENIED,
    buttonPositive: 'OK',
    buttonNegative: 'Cancel',
  });
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const initVoiceTalk = async () => {
  try {
    await Tts.getInitStatus();
  } catch {
    if (Platform.OS === 'android') {
      Tts.requestInstallEngine();
    }
  }
  await Tts.setDefaultLanguage('en-US');
  if (Platform.OS === 'ios') {
    await Tts.setIgnoreSilentSwitch('ignore');
  }
};

const pickBestResult = (values?: string[]) => {
  if (!values?.length) {
    return '';
  }
  return values.reduce((a, b) => (b.length > a.length ? b : a), values[0]);
};

export const bindVoiceListeners = (handlers: VoiceListenerHandlers) => {
  voiceHandlers = handlers;
  Voice.removeAllListeners();
  applyVoiceHandlers();
};

export const stopSpeaking = async (): Promise<void> => {
  activeSpeakGeneration += 1;
  clearTtsListeners();
  try {
    await Tts.stop(false);
  } catch {
    try {
      await Tts.stop();
    } catch {
      // no active utterance
    }
  }
};

export const stopListening = async () => {
  try {
    await Voice.cancel();
  } catch {
    // ignore
  }
  try {
    await Voice.stop();
  } catch {
    // ignore
  }
};

/** iOS mic uses PlayAndRecord (earpiece). Tear down before TTS loudspeaker. */
export const releaseMicForPlayback = async (): Promise<void> => {
  await stopListening();
  if (Platform.OS !== 'ios') {
    return;
  }
  try {
    await Voice.destroy();
  } catch {
    // ignore
  }
  await forceMainSpeaker();
  await new Promise<void>((resolve) => setTimeout(resolve, 350));
};

export const haltAllVoice = async () => {
  await stopSpeaking();
  await stopListening();
};

export const unbindVoiceTalk = async () => {
  await haltAllVoice();
  voiceHandlers = null;
  try {
    await Voice.destroy();
    Voice.removeAllListeners();
  } catch {
    // ignore
  }
};

export const startListening = async () => {
  await stopSpeaking();
  if (Platform.OS === 'android') {
    try {
      await Voice.destroy();
    } catch {
      // ignore
    }
  } else {
    await stopListening();
  }

  applyVoiceHandlers();

  if (Platform.OS === 'android') {
    const androidOptions = {
      EXTRA_PARTIAL_RESULTS: true,
      EXTRA_MAX_RESULTS: 5,
      REQUEST_PERMISSIONS_AUTO: false,
    };
    try {
      await Voice.start('en-US', {
        ...androidOptions,
        RECOGNIZER_ENGINE: 'GOOGLE',
      });
    } catch {
      await Voice.start('en-US', androidOptions);
    }
  } else {
    await Voice.start('en-US');
  }
};

const getTtsProfile = (personalityId: string): PersonalityTtsProfile => {
  if (isPersonalityId(personalityId)) {
    return PERSONALITY_TTS[personalityId as PersonalityId];
  }
  return PERSONALITY_TTS.normal;
};

export const speakReply = async (
  text: string,
  personalityId: string,
  onDone: () => void,
  onStart?: () => void,
): Promise<void> => {
  const speakId = activeSpeakGeneration + 1;
  activeSpeakGeneration = speakId;
  await stopSpeaking();
  if (speakId !== activeSpeakGeneration) {
    return;
  }

  const profile = getTtsProfile(personalityId);
  const finish = () => {
    if (speakId !== activeSpeakGeneration) {
      return;
    }
    activeSpeakGeneration += 1;
    clearTtsListeners();
    onDone();
  };

  const startSub = Tts.addEventListener('tts-start', () => {
    if (speakId === activeSpeakGeneration) {
      onStart?.();
    }
  });
  const endEvents: Array<'tts-finish' | 'tts-cancel' | 'tts-error'> =
    Platform.OS === 'ios' ? ['tts-finish'] : ['tts-finish', 'tts-cancel', 'tts-error'];
  ttsSubscriptions = [
    startSub,
    ...endEvents.map((type) => Tts.addEventListener(type, finish)),
  ];

  try {
    await Tts.setDefaultRate(profile.rate, true);
    await Tts.setDefaultPitch(profile.pitch);
  } catch {
    // continue
  }

  if (speakId !== activeSpeakGeneration) {
    clearTtsListeners();
    return;
  }

  if (Platform.OS === 'ios') {
    Tts.speak(text, { rate: profile.rate });
  } else {
    Tts.speak(text, {
      androidParams: {
        KEY_PARAM_PAN: 0,
        KEY_PARAM_VOLUME: 1,
        KEY_PARAM_STREAM: 'STREAM_MUSIC',
      },
    });
  }
};

export const isBenignAndroidSpeechError = (event: SpeechErrorEvent): boolean => {
  if (Platform.OS !== 'android') {
    return false;
  }
  const code = String(event?.error?.code ?? '');
  // 7 = no match, 11 = didn't understand — common while pausing between words
  return code === '7' || code === '11';
};
